/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor", "vs/base/common/event", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/editor/common/services/resolverService", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/platform/workspace/common/workspace", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/serviceCollection", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/editor/common/services/languageService", "vs/editor/common/services/modelService", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/language", "vs/workbench/services/history/common/history", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/environment/common/environment", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/editor/common/services/textResourceConfiguration", "vs/editor/common/core/position", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/editor/common/core/range", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/services/extensions/common/extensions", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/decorations/common/decorations", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/services/codeEditorService", "vs/workbench/browser/editor", "vs/base/browser/dom", "vs/platform/log/common/log", "vs/platform/label/common/label", "vs/base/common/async", "vs/platform/storage/common/storage", "vs/base/common/platform", "vs/workbench/services/label/common/labelService", "vs/base/common/buffer", "vs/base/common/network", "vs/platform/product/common/product", "vs/workbench/services/host/browser/host", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/accessibility/common/accessibility", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/textfile/browser/browserTextFileService", "vs/workbench/services/environment/common/environmentService", "vs/editor/common/model/textModel", "vs/workbench/services/path/common/pathService", "vs/platform/progress/common/progress", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/editor/editorPane", "vs/base/common/cancellation", "vs/platform/instantiation/common/descriptors", "vs/platform/dialogs/test/common/testDialogService", "vs/workbench/services/editor/browser/codeEditorService", "vs/workbench/browser/parts/editor/editorPart", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/quickinput/browser/quickInputService", "vs/platform/list/browser/listService", "vs/base/common/path", "vs/workbench/test/common/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/stream", "vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/encoding", "vs/platform/theme/common/theme", "vs/base/common/iterator", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/workbench/services/workingCopy/browser/workingCopyBackupService", "vs/platform/files/common/fileService", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/editor/test/browser/testCodeEditor", "vs/workbench/contrib/files/browser/editors/textFileEditor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/types", "vs/workbench/services/editor/browser/editorResolverService", "vs/workbench/contrib/files/common/files", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/files/browser/elevatedFileService", "vs/editor/common/services/editorWorker", "vs/base/common/map", "vs/workbench/common/editor/sideBySideEditorInput", "vs/workbench/services/textfile/common/textEditorService", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/base/common/process", "vs/base/common/extpath", "vs/platform/accessibility/test/common/testAccessibilityService", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/workbench/browser/parts/editor/textEditor", "vs/editor/common/core/selection", "vs/editor/test/common/services/testEditorWorkerService", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/codicons", "vs/workbench/services/hover/browser/hover", "vs/platform/remote/common/remoteSocketFactoryService"], function (require, exports, fileEditorInput_1, instantiationServiceMock_1, resources_1, uri_1, telemetry_1, telemetryUtils_1, editorInput_1, editor_1, event_1, workingCopyBackup_1, configuration_1, layoutService_1, textModelResolverService_1, resolverService_1, untitledTextEditorService_1, workspace_1, lifecycle_1, serviceCollection_1, files_1, model_1, languageService_1, modelService_1, textfiles_1, language_1, history_1, instantiation_1, testConfigurationService_1, testWorkspace_1, environment_1, themeService_1, testThemeService_1, textResourceConfiguration_1, position_1, actions_1, contextkey_1, mockKeybindingService_1, range_1, dialogs_1, notification_1, testNotificationService_1, extensions_1, keybinding_1, decorations_1, lifecycle_2, editorGroupsService_1, editorService_1, codeEditorService_1, editor_2, dom_1, log_1, label_1, async_1, storage_1, platform_1, labelService_1, buffer_1, network_1, product_1, host_1, workingCopyService_1, filesConfigurationService_1, accessibility_1, environmentService_1, browserTextFileService_1, environmentService_2, textModel_1, pathService_1, progress_1, workingCopyFileService_1, undoRedoService_1, undoRedo_1, textFileEditorModel_1, platform_2, editorPane_1, cancellation_1, descriptors_1, testDialogService_1, codeEditorService_2, editorPart_1, quickInput_1, quickInputService_1, listService_1, path_1, workbenchTestServices_1, uriIdentity_1, uriIdentityService_1, inMemoryFilesystemProvider_1, stream_1, textFileService_1, encoding_1, theme_1, iterator_1, workingCopyBackupService_1, workingCopyBackupService_2, fileService_1, textResourceEditor_1, testCodeEditor_1, textFileEditor_1, textResourceEditorInput_1, untitledTextEditorInput_1, sideBySideEditor_1, workspaces_1, workspaceTrust_1, terminal_1, types_1, editorResolverService_1, files_2, editorResolverService_2, workingCopyEditorService_1, elevatedFileService_1, elevatedFileService_2, editorWorker_1, map_1, sideBySideEditorInput_1, textEditorService_1, panecomposite_1, languageConfigurationRegistry_1, testLanguageConfigurationService_1, process_1, extpath_1, testAccessibilityService_1, languageFeatureDebounce_1, languageFeatures_1, languageFeaturesService_1, textEditor_1, selection_1, testEditorWorkerService_1, remoteAgentService_1, languageDetectionWorkerService_1, userDataProfile_1, userDataProfileService_1, userDataProfile_2, codicons_1, hover_1, remoteSocketFactoryService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.workbenchTeardown = exports.TestWebExtensionsScannerService = exports.TestUserDataProfileService = exports.TestWorkbenchExtensionManagementService = exports.TestWorkbenchExtensionEnablementService = exports.TestRemoteExtensionsScannerService = exports.TestRemoteAgentService = exports.TestQuickInputService = exports.TestTerminalProfileResolverService = exports.TestTerminalProfileService = exports.TestTerminalGroupService = exports.TestTerminalEditorService = exports.TestTerminalInstanceService = exports.TestWorkspacesService = exports.getLastResolvedFileStat = exports.TestPathService = exports.TestListService = exports.createEditorPart = exports.TestEditorPart = exports.TestSingletonFileEditorInput = exports.TestFileEditorInput = exports.registerTestSideBySideEditor = exports.registerTestResourceEditor = exports.registerTestFileEditor = exports.registerTestEditor = exports.TestEditorInput = exports.TestReadonlyTextFileEditorModel = exports.TestFilesConfigurationService = exports.TestHostService = exports.productService = exports.TestInMemoryFileSystemProvider = exports.RemoteFileSystemProvider = exports.TestTextResourceConfigurationService = exports.TestWillShutdownEvent = exports.TestBeforeShutdownEvent = exports.TestLifecycleService = exports.InMemoryTestWorkingCopyBackupService = exports.toTypedWorkingCopyId = exports.toUntypedWorkingCopyId = exports.TestWorkingCopyBackupService = exports.TestFileService = exports.TestEditorService = exports.TestEditorGroupAccessor = exports.TestEditorGroupView = exports.TestEditorGroupsService = exports.TestViewsService = exports.TestPanelPart = exports.TestSideBarPart = exports.TestPaneCompositeService = exports.TestLayoutService = exports.TestFileDialogService = exports.TestHistoryService = exports.TestMenuService = exports.TestDecorationsService = exports.TestProgressService = exports.TestEnvironmentService = exports.TestEncodingOracle = exports.TestBrowserTextFileServiceWithEncodingOverrides = exports.TestTextFileService = exports.TestServiceAccessor = exports.workbenchInstantiationService = exports.TestWorkingCopyService = exports.TestTextFileEditor = exports.TestTextResourceEditor = exports.createFileEditorInput = void 0;
    function createFileEditorInput(instantiationService, resource) {
        return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, undefined, undefined, undefined, undefined, undefined, undefined);
    }
    exports.createFileEditorInput = createFileEditorInput;
    platform_2.Registry.as(editor_1.EditorExtensions.EditorFactory).registerFileEditorFactory({
        typeId: files_2.FILE_EDITOR_INPUT_ID,
        createFileEditor: (resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService) => {
            return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents);
        },
        isFileEditor: (obj) => {
            return obj instanceof fileEditorInput_1.FileEditorInput;
        }
    });
    class TestTextResourceEditor extends textResourceEditor_1.TextResourceEditor {
        createEditorControl(parent, configuration) {
            this.editorControl = this._register(this.instantiationService.createInstance(testCodeEditor_1.TestCodeEditor, parent, configuration, {}));
        }
    }
    exports.TestTextResourceEditor = TestTextResourceEditor;
    class TestTextFileEditor extends textFileEditor_1.TextFileEditor {
        createEditorControl(parent, configuration) {
            this.editorControl = this._register(this.instantiationService.createInstance(testCodeEditor_1.TestCodeEditor, parent, configuration, { contributions: [] }));
        }
        setSelection(selection, reason) {
            this._options = selection ? { selection } : undefined;
            this._onDidChangeSelection.fire({ reason });
        }
        getSelection() {
            const options = this.options;
            if (!options) {
                return undefined;
            }
            const textSelection = options.selection;
            if (!textSelection) {
                return undefined;
            }
            return new textEditor_1.TextEditorPaneSelection(new selection_1.Selection(textSelection.startLineNumber, textSelection.startColumn, textSelection.endLineNumber ?? textSelection.startLineNumber, textSelection.endColumn ?? textSelection.startColumn));
        }
    }
    exports.TestTextFileEditor = TestTextFileEditor;
    class TestWorkingCopyService extends workingCopyService_1.WorkingCopyService {
        testUnregisterWorkingCopy(workingCopy) {
            return super.unregisterWorkingCopy(workingCopy);
        }
    }
    exports.TestWorkingCopyService = TestWorkingCopyService;
    function workbenchInstantiationService(overrides, disposables = new lifecycle_2.DisposableStore()) {
        const instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService(new serviceCollection_1.ServiceCollection([lifecycle_1.ILifecycleService, disposables.add(new TestLifecycleService())])));
        instantiationService.stub(editorWorker_1.IEditorWorkerService, new testEditorWorkerService_1.TestEditorWorkerService());
        instantiationService.stub(workingCopyService_1.IWorkingCopyService, disposables.add(new TestWorkingCopyService()));
        const environmentService = overrides?.environmentService ? overrides.environmentService(instantiationService) : exports.TestEnvironmentService;
        instantiationService.stub(environment_1.IEnvironmentService, environmentService);
        instantiationService.stub(environmentService_2.IWorkbenchEnvironmentService, environmentService);
        const contextKeyService = overrides?.contextKeyService ? overrides.contextKeyService(instantiationService) : instantiationService.createInstance(mockKeybindingService_1.MockContextKeyService);
        instantiationService.stub(contextkey_1.IContextKeyService, contextKeyService);
        instantiationService.stub(progress_1.IProgressService, new TestProgressService());
        const workspaceContextService = new workbenchTestServices_1.TestContextService(testWorkspace_1.TestWorkspace);
        instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceContextService);
        const configService = overrides?.configurationService ? overrides.configurationService(instantiationService) : new testConfigurationService_1.TestConfigurationService({
            files: {
                participants: {
                    timeout: 60000
                }
            }
        });
        instantiationService.stub(configuration_1.IConfigurationService, configService);
        instantiationService.stub(textResourceConfiguration_1.ITextResourceConfigurationService, new TestTextResourceConfigurationService(configService));
        instantiationService.stub(untitledTextEditorService_1.IUntitledTextEditorService, disposables.add(instantiationService.createInstance(untitledTextEditorService_1.UntitledTextEditorService)));
        instantiationService.stub(storage_1.IStorageService, disposables.add(new workbenchTestServices_1.TestStorageService()));
        instantiationService.stub(remoteAgentService_1.IRemoteAgentService, new TestRemoteAgentService());
        instantiationService.stub(languageDetectionWorkerService_1.ILanguageDetectionService, new TestLanguageDetectionService());
        instantiationService.stub(pathService_1.IPathService, overrides?.pathService ? overrides.pathService(instantiationService) : new TestPathService());
        const layoutService = new TestLayoutService();
        instantiationService.stub(layoutService_1.IWorkbenchLayoutService, layoutService);
        instantiationService.stub(dialogs_1.IDialogService, new testDialogService_1.TestDialogService());
        const accessibilityService = new testAccessibilityService_1.TestAccessibilityService();
        instantiationService.stub(accessibility_1.IAccessibilityService, accessibilityService);
        instantiationService.stub(dialogs_1.IFileDialogService, instantiationService.createInstance(TestFileDialogService));
        instantiationService.stub(language_1.ILanguageService, disposables.add(instantiationService.createInstance(languageService_1.LanguageService)));
        instantiationService.stub(languageFeatures_1.ILanguageFeaturesService, new languageFeaturesService_1.LanguageFeaturesService());
        instantiationService.stub(languageFeatureDebounce_1.ILanguageFeatureDebounceService, instantiationService.createInstance(languageFeatureDebounce_1.LanguageFeatureDebounceService));
        instantiationService.stub(history_1.IHistoryService, new TestHistoryService());
        instantiationService.stub(textResourceConfiguration_1.ITextResourcePropertiesService, new workbenchTestServices_1.TestTextResourcePropertiesService(configService));
        instantiationService.stub(undoRedo_1.IUndoRedoService, instantiationService.createInstance(undoRedoService_1.UndoRedoService));
        const themeService = new testThemeService_1.TestThemeService();
        instantiationService.stub(themeService_1.IThemeService, themeService);
        instantiationService.stub(languageConfigurationRegistry_1.ILanguageConfigurationService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
        instantiationService.stub(model_1.IModelService, disposables.add(instantiationService.createInstance(modelService_1.ModelService)));
        const fileService = overrides?.fileService ? overrides.fileService(instantiationService) : disposables.add(new TestFileService());
        instantiationService.stub(files_1.IFileService, fileService);
        const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
        disposables.add(uriIdentityService);
        instantiationService.stub(filesConfigurationService_1.IFilesConfigurationService, disposables.add(new TestFilesConfigurationService(contextKeyService, configService, workspaceContextService, environmentService, uriIdentityService, fileService)));
        instantiationService.stub(uriIdentity_1.IUriIdentityService, disposables.add(uriIdentityService));
        const userDataProfilesService = instantiationService.stub(userDataProfile_1.IUserDataProfilesService, disposables.add(new userDataProfile_1.UserDataProfilesService(environmentService, fileService, uriIdentityService, new log_1.NullLogService())));
        instantiationService.stub(userDataProfile_2.IUserDataProfileService, disposables.add(new userDataProfileService_1.UserDataProfileService(userDataProfilesService.defaultProfile)));
        instantiationService.stub(workingCopyBackup_1.IWorkingCopyBackupService, overrides?.workingCopyBackupService ? overrides?.workingCopyBackupService(instantiationService) : disposables.add(new TestWorkingCopyBackupService()));
        instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
        instantiationService.stub(notification_1.INotificationService, new testNotificationService_1.TestNotificationService());
        instantiationService.stub(untitledTextEditorService_1.IUntitledTextEditorService, disposables.add(instantiationService.createInstance(untitledTextEditorService_1.UntitledTextEditorService)));
        instantiationService.stub(actions_1.IMenuService, new TestMenuService());
        const keybindingService = new mockKeybindingService_1.MockKeybindingService();
        instantiationService.stub(keybinding_1.IKeybindingService, keybindingService);
        instantiationService.stub(decorations_1.IDecorationsService, new TestDecorationsService());
        instantiationService.stub(extensions_1.IExtensionService, new workbenchTestServices_1.TestExtensionService());
        instantiationService.stub(workingCopyFileService_1.IWorkingCopyFileService, disposables.add(instantiationService.createInstance(workingCopyFileService_1.WorkingCopyFileService)));
        instantiationService.stub(textfiles_1.ITextFileService, overrides?.textFileService ? overrides.textFileService(instantiationService) : disposables.add(instantiationService.createInstance(TestTextFileService)));
        instantiationService.stub(host_1.IHostService, instantiationService.createInstance(TestHostService));
        instantiationService.stub(resolverService_1.ITextModelService, disposables.add(instantiationService.createInstance(textModelResolverService_1.TextModelResolverService)));
        instantiationService.stub(log_1.ILoggerService, disposables.add(new workbenchTestServices_1.TestLoggerService(exports.TestEnvironmentService.logsHome)));
        instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
        const editorGroupService = new TestEditorGroupsService([new TestEditorGroupView(0)]);
        instantiationService.stub(editorGroupsService_1.IEditorGroupsService, editorGroupService);
        instantiationService.stub(label_1.ILabelService, disposables.add(instantiationService.createInstance(labelService_1.LabelService)));
        const editorService = overrides?.editorService ? overrides.editorService(instantiationService) : new TestEditorService(editorGroupService);
        instantiationService.stub(editorService_1.IEditorService, editorService);
        instantiationService.stub(workingCopyEditorService_1.IWorkingCopyEditorService, disposables.add(instantiationService.createInstance(workingCopyEditorService_1.WorkingCopyEditorService)));
        instantiationService.stub(editorResolverService_2.IEditorResolverService, disposables.add(instantiationService.createInstance(editorResolverService_1.EditorResolverService)));
        const textEditorService = overrides?.textEditorService ? overrides.textEditorService(instantiationService) : disposables.add(instantiationService.createInstance(textEditorService_1.TextEditorService));
        instantiationService.stub(textEditorService_1.ITextEditorService, textEditorService);
        instantiationService.stub(codeEditorService_1.ICodeEditorService, disposables.add(new codeEditorService_2.CodeEditorService(editorService, themeService, configService)));
        instantiationService.stub(panecomposite_1.IPaneCompositePartService, disposables.add(new TestPaneCompositeService()));
        instantiationService.stub(listService_1.IListService, new TestListService());
        const hoverService = instantiationService.stub(hover_1.IHoverService, instantiationService.createInstance(TestHoverService));
        instantiationService.stub(quickInput_1.IQuickInputService, disposables.add(new quickInputService_1.QuickInputService(configService, instantiationService, keybindingService, contextKeyService, themeService, layoutService, hoverService)));
        instantiationService.stub(workspaces_1.IWorkspacesService, new TestWorkspacesService());
        instantiationService.stub(workspaceTrust_1.IWorkspaceTrustManagementService, disposables.add(new workbenchTestServices_1.TestWorkspaceTrustManagementService()));
        instantiationService.stub(workspaceTrust_1.IWorkspaceTrustRequestService, disposables.add(new workbenchTestServices_1.TestWorkspaceTrustRequestService(false)));
        instantiationService.stub(terminal_1.ITerminalInstanceService, new TestTerminalInstanceService());
        instantiationService.stub(elevatedFileService_1.IElevatedFileService, new elevatedFileService_2.BrowserElevatedFileService());
        instantiationService.stub(remoteSocketFactoryService_1.IRemoteSocketFactoryService, new remoteSocketFactoryService_1.RemoteSocketFactoryService());
        return instantiationService;
    }
    exports.workbenchInstantiationService = workbenchInstantiationService;
    let TestServiceAccessor = class TestServiceAccessor {
        constructor(lifecycleService, textFileService, textEditorService, workingCopyFileService, filesConfigurationService, contextService, modelService, fileService, fileDialogService, dialogService, workingCopyService, editorService, environmentService, pathService, editorGroupService, editorResolverService, languageService, textModelResolverService, untitledTextEditorService, testConfigurationService, workingCopyBackupService, hostService, quickInputService, labelService, logService, uriIdentityService, instantitionService, notificationService, workingCopyEditorService, instantiationService, elevatedFileService, workspaceTrustRequestService, decorationsService) {
            this.lifecycleService = lifecycleService;
            this.textFileService = textFileService;
            this.textEditorService = textEditorService;
            this.workingCopyFileService = workingCopyFileService;
            this.filesConfigurationService = filesConfigurationService;
            this.contextService = contextService;
            this.modelService = modelService;
            this.fileService = fileService;
            this.fileDialogService = fileDialogService;
            this.dialogService = dialogService;
            this.workingCopyService = workingCopyService;
            this.editorService = editorService;
            this.environmentService = environmentService;
            this.pathService = pathService;
            this.editorGroupService = editorGroupService;
            this.editorResolverService = editorResolverService;
            this.languageService = languageService;
            this.textModelResolverService = textModelResolverService;
            this.untitledTextEditorService = untitledTextEditorService;
            this.testConfigurationService = testConfigurationService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.hostService = hostService;
            this.quickInputService = quickInputService;
            this.labelService = labelService;
            this.logService = logService;
            this.uriIdentityService = uriIdentityService;
            this.instantitionService = instantitionService;
            this.notificationService = notificationService;
            this.workingCopyEditorService = workingCopyEditorService;
            this.instantiationService = instantiationService;
            this.elevatedFileService = elevatedFileService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.decorationsService = decorationsService;
        }
    };
    exports.TestServiceAccessor = TestServiceAccessor;
    exports.TestServiceAccessor = TestServiceAccessor = __decorate([
        __param(0, lifecycle_1.ILifecycleService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, textEditorService_1.ITextEditorService),
        __param(3, workingCopyFileService_1.IWorkingCopyFileService),
        __param(4, filesConfigurationService_1.IFilesConfigurationService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, model_1.IModelService),
        __param(7, files_1.IFileService),
        __param(8, dialogs_1.IFileDialogService),
        __param(9, dialogs_1.IDialogService),
        __param(10, workingCopyService_1.IWorkingCopyService),
        __param(11, editorService_1.IEditorService),
        __param(12, environmentService_2.IWorkbenchEnvironmentService),
        __param(13, pathService_1.IPathService),
        __param(14, editorGroupsService_1.IEditorGroupsService),
        __param(15, editorResolverService_2.IEditorResolverService),
        __param(16, language_1.ILanguageService),
        __param(17, resolverService_1.ITextModelService),
        __param(18, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(19, configuration_1.IConfigurationService),
        __param(20, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(21, host_1.IHostService),
        __param(22, quickInput_1.IQuickInputService),
        __param(23, label_1.ILabelService),
        __param(24, log_1.ILogService),
        __param(25, uriIdentity_1.IUriIdentityService),
        __param(26, instantiation_1.IInstantiationService),
        __param(27, notification_1.INotificationService),
        __param(28, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(29, instantiation_1.IInstantiationService),
        __param(30, elevatedFileService_1.IElevatedFileService),
        __param(31, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(32, decorations_1.IDecorationsService)
    ], TestServiceAccessor);
    let TestTextFileService = class TestTextFileService extends browserTextFileService_1.BrowserTextFileService {
        constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService) {
            super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService);
            this.readStreamError = undefined;
            this.writeError = undefined;
        }
        setReadStreamErrorOnce(error) {
            this.readStreamError = error;
        }
        async readStream(resource, options) {
            if (this.readStreamError) {
                const error = this.readStreamError;
                this.readStreamError = undefined;
                throw error;
            }
            const content = await this.fileService.readFileStream(resource, options);
            return {
                resource: content.resource,
                name: content.name,
                mtime: content.mtime,
                ctime: content.ctime,
                etag: content.etag,
                encoding: 'utf8',
                value: await (0, textModel_1.createTextBufferFactoryFromStream)(content.value),
                size: 10,
                readonly: false,
                locked: false
            };
        }
        setWriteErrorOnce(error) {
            this.writeError = error;
        }
        async write(resource, value, options) {
            if (this.writeError) {
                const error = this.writeError;
                this.writeError = undefined;
                throw error;
            }
            return super.write(resource, value, options);
        }
    };
    exports.TestTextFileService = TestTextFileService;
    exports.TestTextFileService = TestTextFileService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, model_1.IModelService),
        __param(5, environmentService_2.IWorkbenchEnvironmentService),
        __param(6, dialogs_1.IDialogService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(9, filesConfigurationService_1.IFilesConfigurationService),
        __param(10, codeEditorService_1.ICodeEditorService),
        __param(11, pathService_1.IPathService),
        __param(12, workingCopyFileService_1.IWorkingCopyFileService),
        __param(13, uriIdentity_1.IUriIdentityService),
        __param(14, language_1.ILanguageService),
        __param(15, log_1.ILogService),
        __param(16, elevatedFileService_1.IElevatedFileService),
        __param(17, decorations_1.IDecorationsService)
    ], TestTextFileService);
    class TestBrowserTextFileServiceWithEncodingOverrides extends browserTextFileService_1.BrowserTextFileService {
        get encoding() {
            if (!this._testEncoding) {
                this._testEncoding = this._register(this.instantiationService.createInstance(TestEncodingOracle));
            }
            return this._testEncoding;
        }
    }
    exports.TestBrowserTextFileServiceWithEncodingOverrides = TestBrowserTextFileServiceWithEncodingOverrides;
    class TestEncodingOracle extends textFileService_1.EncodingOracle {
        get encodingOverrides() {
            return [
                { extension: 'utf16le', encoding: encoding_1.UTF16le },
                { extension: 'utf16be', encoding: encoding_1.UTF16be },
                { extension: 'utf8bom', encoding: encoding_1.UTF8_with_bom }
            ];
        }
        set encodingOverrides(overrides) { }
    }
    exports.TestEncodingOracle = TestEncodingOracle;
    class TestEnvironmentServiceWithArgs extends environmentService_1.BrowserWorkbenchEnvironmentService {
        constructor() {
            super(...arguments);
            this.args = [];
        }
    }
    exports.TestEnvironmentService = new TestEnvironmentServiceWithArgs('', uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), Object.create(null), workbenchTestServices_1.TestProductService);
    class TestProgressService {
        withProgress(options, task, onDidCancel) {
            return task(progress_1.Progress.None);
        }
    }
    exports.TestProgressService = TestProgressService;
    class TestDecorationsService {
        constructor() {
            this.onDidChangeDecorations = event_1.Event.None;
        }
        registerDecorationsProvider(_provider) { return lifecycle_2.Disposable.None; }
        getDecoration(_uri, _includeChildren, _overwrite) { return undefined; }
    }
    exports.TestDecorationsService = TestDecorationsService;
    class TestMenuService {
        createMenu(_id, _scopedKeybindingService) {
            return {
                onDidChange: event_1.Event.None,
                dispose: () => undefined,
                getActions: () => []
            };
        }
        resetHiddenStates() {
            // nothing
        }
    }
    exports.TestMenuService = TestMenuService;
    class TestHistoryService {
        constructor(root) {
            this.root = root;
        }
        async reopenLastClosedEditor() { }
        async goForward() { }
        async goBack() { }
        async goPrevious() { }
        async goLast() { }
        removeFromHistory(_input) { }
        clear() { }
        clearRecentlyOpened() { }
        getHistory() { return []; }
        async openNextRecentlyUsedEditor(group) { }
        async openPreviouslyUsedEditor(group) { }
        getLastActiveWorkspaceRoot(_schemeFilter) { return this.root; }
        getLastActiveFile(_schemeFilter) { return undefined; }
    }
    exports.TestHistoryService = TestHistoryService;
    let TestFileDialogService = class TestFileDialogService {
        constructor(pathService) {
            this.pathService = pathService;
        }
        async defaultFilePath(_schemeFilter) { return this.pathService.userHome(); }
        async defaultFolderPath(_schemeFilter) { return this.pathService.userHome(); }
        async defaultWorkspacePath(_schemeFilter) { return this.pathService.userHome(); }
        async preferredHome(_schemeFilter) { return this.pathService.userHome(); }
        pickFileFolderAndOpen(_options) { return Promise.resolve(0); }
        pickFileAndOpen(_options) { return Promise.resolve(0); }
        pickFolderAndOpen(_options) { return Promise.resolve(0); }
        pickWorkspaceAndOpen(_options) { return Promise.resolve(0); }
        setPickFileToSave(path) { this.fileToSave = path; }
        pickFileToSave(defaultUri, availableFileSystems) { return Promise.resolve(this.fileToSave); }
        showSaveDialog(_options) { return Promise.resolve(undefined); }
        showOpenDialog(_options) { return Promise.resolve(undefined); }
        setConfirmResult(result) { this.confirmResult = result; }
        showSaveConfirm(fileNamesOrResources) { return Promise.resolve(this.confirmResult); }
    };
    exports.TestFileDialogService = TestFileDialogService;
    exports.TestFileDialogService = TestFileDialogService = __decorate([
        __param(0, pathService_1.IPathService)
    ], TestFileDialogService);
    class TestLayoutService {
        constructor() {
            this.openedDefaultEditors = false;
            this.dimension = { width: 800, height: 600 };
            this.offset = { top: 0, quickPickTop: 0 };
            this.hasContainer = true;
            this.container = window.document.body;
            this.onDidChangeZenMode = event_1.Event.None;
            this.onDidChangeCenteredLayout = event_1.Event.None;
            this.onDidChangeFullscreen = event_1.Event.None;
            this.onDidChangeWindowMaximized = event_1.Event.None;
            this.onDidChangePanelPosition = event_1.Event.None;
            this.onDidChangePanelAlignment = event_1.Event.None;
            this.onDidChangePartVisibility = event_1.Event.None;
            this.onDidLayout = event_1.Event.None;
            this.onDidChangeNotificationsVisibility = event_1.Event.None;
            this.whenReady = Promise.resolve(undefined);
            this.whenRestored = Promise.resolve(undefined);
        }
        layout() { }
        isRestored() { return true; }
        hasFocus(_part) { return false; }
        focusPart(_part) { }
        hasWindowBorder() { return false; }
        getWindowBorderWidth() { return 0; }
        getWindowBorderRadius() { return undefined; }
        isVisible(_part) { return true; }
        getDimension(_part) { return new dom_1.Dimension(0, 0); }
        getContainer(_part) { return null; }
        isTitleBarHidden() { return false; }
        isStatusBarHidden() { return false; }
        isActivityBarHidden() { return false; }
        setActivityBarHidden(_hidden) { }
        setBannerHidden(_hidden) { }
        isSideBarHidden() { return false; }
        async setEditorHidden(_hidden) { }
        async setSideBarHidden(_hidden) { }
        async setAuxiliaryBarHidden(_hidden) { }
        async setPartHidden(_hidden, part) { }
        isPanelHidden() { return false; }
        async setPanelHidden(_hidden) { }
        toggleMaximizedPanel() { }
        isPanelMaximized() { return false; }
        getMenubarVisibility() { throw new Error('not implemented'); }
        toggleMenuBar() { }
        getSideBarPosition() { return 0; }
        getPanelPosition() { return 0; }
        getPanelAlignment() { return 'center'; }
        async setPanelPosition(_position) { }
        async setPanelAlignment(_alignment) { }
        addClass(_clazz) { }
        removeClass(_clazz) { }
        getMaximumEditorDimensions() { throw new Error('not implemented'); }
        toggleZenMode() { }
        isEditorLayoutCentered() { return false; }
        centerEditorLayout(_active) { }
        resizePart(_part, _sizeChangeWidth, _sizeChangeHeight) { }
        registerPart(part) { }
        isWindowMaximized() { return false; }
        updateWindowMaximizedState(maximized) { }
        getVisibleNeighborPart(part, direction) { return undefined; }
        focus() { }
    }
    exports.TestLayoutService = TestLayoutService;
    const activeViewlet = {};
    class TestPaneCompositeService extends lifecycle_2.Disposable {
        constructor() {
            super();
            this.parts = new Map();
            this.parts.set(1 /* ViewContainerLocation.Panel */, new TestPanelPart());
            this.parts.set(0 /* ViewContainerLocation.Sidebar */, new TestSideBarPart());
            this.onDidPaneCompositeOpen = event_1.Event.any(...([1 /* ViewContainerLocation.Panel */, 0 /* ViewContainerLocation.Sidebar */].map(loc => event_1.Event.map(this.parts.get(loc).onDidPaneCompositeOpen, composite => { return { composite, viewContainerLocation: loc }; }))));
            this.onDidPaneCompositeClose = event_1.Event.any(...([1 /* ViewContainerLocation.Panel */, 0 /* ViewContainerLocation.Sidebar */].map(loc => event_1.Event.map(this.parts.get(loc).onDidPaneCompositeClose, composite => { return { composite, viewContainerLocation: loc }; }))));
        }
        openPaneComposite(id, viewContainerLocation, focus) {
            return this.getPartByLocation(viewContainerLocation).openPaneComposite(id, focus);
        }
        getActivePaneComposite(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getActivePaneComposite();
        }
        getPaneComposite(id, viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getPaneComposite(id);
        }
        getPaneComposites(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getPaneComposites();
        }
        getProgressIndicator(id, viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getProgressIndicator(id);
        }
        hideActivePaneComposite(viewContainerLocation) {
            this.getPartByLocation(viewContainerLocation).hideActivePaneComposite();
        }
        getLastActivePaneCompositeId(viewContainerLocation) {
            return this.getPartByLocation(viewContainerLocation).getLastActivePaneCompositeId();
        }
        getPinnedPaneCompositeIds(viewContainerLocation) {
            throw new Error('Method not implemented.');
        }
        getVisiblePaneCompositeIds(viewContainerLocation) {
            throw new Error('Method not implemented.');
        }
        showActivity(id, viewContainerLocation, badge, clazz, priority) {
            throw new Error('Method not implemented.');
        }
        getPartByLocation(viewContainerLocation) {
            return (0, types_1.assertIsDefined)(this.parts.get(viewContainerLocation));
        }
    }
    exports.TestPaneCompositeService = TestPaneCompositeService;
    class TestSideBarPart {
        constructor() {
            this.onDidViewletRegisterEmitter = new event_1.Emitter();
            this.onDidViewletDeregisterEmitter = new event_1.Emitter();
            this.onDidViewletOpenEmitter = new event_1.Emitter();
            this.onDidViewletCloseEmitter = new event_1.Emitter();
            this.element = undefined;
            this.minimumWidth = 0;
            this.maximumWidth = 0;
            this.minimumHeight = 0;
            this.maximumHeight = 0;
            this.onDidChange = event_1.Event.None;
            this.onDidPaneCompositeOpen = this.onDidViewletOpenEmitter.event;
            this.onDidPaneCompositeClose = this.onDidViewletCloseEmitter.event;
        }
        openPaneComposite(id, focus) { return Promise.resolve(undefined); }
        getPaneComposites() { return []; }
        getAllViewlets() { return []; }
        getActivePaneComposite() { return activeViewlet; }
        getDefaultViewletId() { return 'workbench.view.explorer'; }
        getPaneComposite(id) { return undefined; }
        getProgressIndicator(id) { return undefined; }
        hideActivePaneComposite() { }
        getLastActivePaneCompositeId() { return undefined; }
        dispose() { }
        layout(width, height, top, left) { }
    }
    exports.TestSideBarPart = TestSideBarPart;
    class TestHoverService {
        showHover(options, focus) {
            this.currentHover = new class {
                constructor() {
                    this._isDisposed = false;
                }
                get isDisposed() { return this._isDisposed; }
                dispose() {
                    this._isDisposed = true;
                }
            };
            return this.currentHover;
        }
        showAndFocusLastHover() { }
        hideHover() {
            this.currentHover?.dispose();
        }
    }
    class TestPanelPart {
        constructor() {
            this.element = undefined;
            this.minimumWidth = 0;
            this.maximumWidth = 0;
            this.minimumHeight = 0;
            this.maximumHeight = 0;
            this.onDidChange = event_1.Event.None;
            this.onDidPaneCompositeOpen = new event_1.Emitter().event;
            this.onDidPaneCompositeClose = new event_1.Emitter().event;
        }
        async openPaneComposite(id, focus) { return undefined; }
        getPaneComposite(id) { return activeViewlet; }
        getPaneComposites() { return []; }
        getPinnedPaneCompositeIds() { return []; }
        getVisiblePaneCompositeIds() { return []; }
        getActivePaneComposite() { return activeViewlet; }
        setPanelEnablement(id, enabled) { }
        dispose() { }
        showActivity(panelId, badge, clazz) { throw new Error('Method not implemented.'); }
        getProgressIndicator(id) { return null; }
        hideActivePaneComposite() { }
        getLastActivePaneCompositeId() { return undefined; }
        layout(width, height, top, left) { }
    }
    exports.TestPanelPart = TestPanelPart;
    class TestViewsService {
        constructor() {
            this.onDidChangeViewContainerVisibility = new event_1.Emitter().event;
            this.onDidChangeViewVisibilityEmitter = new event_1.Emitter();
            this.onDidChangeViewVisibility = this.onDidChangeViewVisibilityEmitter.event;
            this.onDidChangeFocusedViewEmitter = new event_1.Emitter();
            this.onDidChangeFocusedView = this.onDidChangeFocusedViewEmitter.event;
        }
        isViewContainerVisible(id) { return true; }
        getVisibleViewContainer() { return null; }
        openViewContainer(id, focus) { return Promise.resolve(null); }
        closeViewContainer(id) { }
        isViewVisible(id) { return true; }
        getActiveViewWithId(id) { return null; }
        getViewWithId(id) { return null; }
        openView(id, focus) { return Promise.resolve(null); }
        closeView(id) { }
        getViewProgressIndicator(id) { return null; }
        getActiveViewPaneContainerWithId(id) { return null; }
        getFocusedViewName() { return ''; }
    }
    exports.TestViewsService = TestViewsService;
    class TestEditorGroupsService {
        constructor(groups = []) {
            this.groups = groups;
            this.onDidChangeActiveGroup = event_1.Event.None;
            this.onDidActivateGroup = event_1.Event.None;
            this.onDidAddGroup = event_1.Event.None;
            this.onDidRemoveGroup = event_1.Event.None;
            this.onDidMoveGroup = event_1.Event.None;
            this.onDidChangeGroupIndex = event_1.Event.None;
            this.onDidChangeGroupLocked = event_1.Event.None;
            this.onDidLayout = event_1.Event.None;
            this.onDidChangeEditorPartOptions = event_1.Event.None;
            this.onDidScroll = event_1.Event.None;
            this.orientation = 0 /* GroupOrientation.HORIZONTAL */;
            this.isReady = true;
            this.whenReady = Promise.resolve(undefined);
            this.whenRestored = Promise.resolve(undefined);
            this.hasRestorableState = false;
            this.contentDimension = { width: 800, height: 600 };
        }
        get activeGroup() { return this.groups[0]; }
        get sideGroup() { return this.groups[0]; }
        get count() { return this.groups.length; }
        getGroups(_order) { return this.groups; }
        getGroup(identifier) { return this.groups.find(group => group.id === identifier); }
        getLabel(_identifier) { return 'Group 1'; }
        findGroup(_scope, _source, _wrap) { throw new Error('not implemented'); }
        activateGroup(_group) { throw new Error('not implemented'); }
        restoreGroup(_group) { throw new Error('not implemented'); }
        getSize(_group) { return { width: 100, height: 100 }; }
        setSize(_group, _size) { }
        arrangeGroups(_arrangement) { }
        applyLayout(_layout) { }
        getLayout() { throw new Error('not implemented'); }
        setGroupOrientation(_orientation) { }
        addGroup(_location, _direction) { throw new Error('not implemented'); }
        removeGroup(_group) { }
        moveGroup(_group, _location, _direction) { throw new Error('not implemented'); }
        mergeGroup(_group, _target, _options) { throw new Error('not implemented'); }
        mergeAllGroups() { throw new Error('not implemented'); }
        copyGroup(_group, _location, _direction) { throw new Error('not implemented'); }
        centerLayout(active) { }
        isLayoutCentered() { return false; }
        enforcePartOptions(options) { return lifecycle_2.Disposable.None; }
    }
    exports.TestEditorGroupsService = TestEditorGroupsService;
    class TestEditorGroupView {
        constructor(id) {
            this.id = id;
            this.editors = [];
            this.whenRestored = Promise.resolve(undefined);
            this.isEmpty = true;
            this.onWillDispose = event_1.Event.None;
            this.onDidModelChange = event_1.Event.None;
            this.onWillCloseEditor = event_1.Event.None;
            this.onDidCloseEditor = event_1.Event.None;
            this.onDidOpenEditorFail = event_1.Event.None;
            this.onDidFocus = event_1.Event.None;
            this.onDidChange = event_1.Event.None;
            this.onWillMoveEditor = event_1.Event.None;
            this.onWillOpenEditor = event_1.Event.None;
            this.onDidActiveEditorChange = event_1.Event.None;
        }
        getEditors(_order) { return []; }
        findEditors(_resource) { return []; }
        getEditorByIndex(_index) { throw new Error('not implemented'); }
        getIndexOfEditor(_editor) { return -1; }
        isFirst(editor) { return false; }
        isLast(editor) { return false; }
        openEditor(_editor, _options) { throw new Error('not implemented'); }
        openEditors(_editors) { throw new Error('not implemented'); }
        isPinned(_editor) { return false; }
        isSticky(_editor) { return false; }
        isActive(_editor) { return false; }
        contains(candidate) { return false; }
        moveEditor(_editor, _target, _options) { }
        moveEditors(_editors, _target) { }
        copyEditor(_editor, _target, _options) { }
        copyEditors(_editors, _target) { }
        async closeEditor(_editor, options) { return true; }
        async closeEditors(_editors, options) { return true; }
        async closeAllEditors(options) { return true; }
        async replaceEditors(_editors) { }
        pinEditor(_editor) { }
        stickEditor(editor) { }
        unstickEditor(editor) { }
        lock(locked) { }
        focus() { }
        get scopedContextKeyService() { throw new Error('not implemented'); }
        setActive(_isActive) { }
        notifyIndexChanged(_index) { }
        dispose() { }
        toJSON() { return Object.create(null); }
        layout(_width, _height) { }
        relayout() { }
    }
    exports.TestEditorGroupView = TestEditorGroupView;
    class TestEditorGroupAccessor {
        constructor() {
            this.groups = [];
            this.partOptions = {};
            this.onDidChangeEditorPartOptions = event_1.Event.None;
            this.onDidVisibilityChange = event_1.Event.None;
        }
        getGroup(identifier) { throw new Error('Method not implemented.'); }
        getGroups(order) { throw new Error('Method not implemented.'); }
        activateGroup(identifier) { throw new Error('Method not implemented.'); }
        restoreGroup(identifier) { throw new Error('Method not implemented.'); }
        addGroup(location, direction) { throw new Error('Method not implemented.'); }
        mergeGroup(group, target, options) { throw new Error('Method not implemented.'); }
        moveGroup(group, location, direction) { throw new Error('Method not implemented.'); }
        copyGroup(group, location, direction) { throw new Error('Method not implemented.'); }
        removeGroup(group) { throw new Error('Method not implemented.'); }
        arrangeGroups(arrangement, target) { throw new Error('Method not implemented.'); }
    }
    exports.TestEditorGroupAccessor = TestEditorGroupAccessor;
    class TestEditorService {
        get activeTextEditorControl() { return this._activeTextEditorControl; }
        set activeTextEditorControl(value) { this._activeTextEditorControl = value; }
        get activeEditor() { return this._activeEditor; }
        set activeEditor(value) { this._activeEditor = value; }
        constructor(editorGroupService) {
            this.editorGroupService = editorGroupService;
            this.onDidActiveEditorChange = event_1.Event.None;
            this.onDidVisibleEditorsChange = event_1.Event.None;
            this.onDidEditorsChange = event_1.Event.None;
            this.onDidCloseEditor = event_1.Event.None;
            this.onDidOpenEditorFail = event_1.Event.None;
            this.onDidMostRecentlyActiveEditorsChange = event_1.Event.None;
            this.editors = [];
            this.mostRecentlyActiveEditors = [];
            this.visibleEditorPanes = [];
            this.visibleTextEditorControls = [];
            this.visibleEditors = [];
            this.count = this.editors.length;
        }
        getEditors() { return []; }
        findEditors() { return []; }
        async openEditor(editor, optionsOrGroup, group) {
            return undefined;
        }
        async closeEditor(editor, options) { }
        async closeEditors(editors, options) { }
        doResolveEditorOpenRequest(editor) {
            if (!this.editorGroupService) {
                return undefined;
            }
            return [this.editorGroupService.activeGroup, editor, undefined];
        }
        openEditors(_editors, _group) { throw new Error('not implemented'); }
        isOpened(_editor) { return false; }
        isVisible(_editor) { return false; }
        replaceEditors(_editors, _group) { return Promise.resolve(undefined); }
        save(editors, options) { throw new Error('Method not implemented.'); }
        saveAll(options) { throw new Error('Method not implemented.'); }
        revert(editors, options) { throw new Error('Method not implemented.'); }
        revertAll(options) { throw new Error('Method not implemented.'); }
    }
    exports.TestEditorService = TestEditorService;
    class TestFileService {
        constructor() {
            this._onDidFilesChange = new event_1.Emitter();
            this._onDidRunOperation = new event_1.Emitter();
            this._onDidChangeFileSystemProviderCapabilities = new event_1.Emitter();
            this.onWillActivateFileSystemProvider = event_1.Event.None;
            this.onDidWatchError = event_1.Event.None;
            this.content = 'Hello Html';
            this.readonly = false;
            this.notExistsSet = new map_1.ResourceMap();
            this.readShouldThrowError = undefined;
            this.writeShouldThrowError = undefined;
            this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
            this.providers = new Map();
            this.watches = [];
        }
        get onDidFilesChange() { return this._onDidFilesChange.event; }
        fireFileChanges(event) { this._onDidFilesChange.fire(event); }
        get onDidRunOperation() { return this._onDidRunOperation.event; }
        fireAfterOperation(event) { this._onDidRunOperation.fire(event); }
        get onDidChangeFileSystemProviderCapabilities() { return this._onDidChangeFileSystemProviderCapabilities.event; }
        fireFileSystemProviderCapabilitiesChangeEvent(event) { this._onDidChangeFileSystemProviderCapabilities.fire(event); }
        setContent(content) { this.content = content; }
        getContent() { return this.content; }
        getLastReadFileUri() { return this.lastReadFileUri; }
        async resolve(resource, _options) {
            return (0, workbenchTestServices_1.createFileStat)(resource, this.readonly);
        }
        stat(resource) {
            return this.resolve(resource, { resolveMetadata: true });
        }
        async resolveAll(toResolve) {
            const stats = await Promise.all(toResolve.map(resourceAndOption => this.resolve(resourceAndOption.resource, resourceAndOption.options)));
            return stats.map(stat => ({ stat, success: true }));
        }
        async exists(_resource) { return !this.notExistsSet.has(_resource); }
        async readFile(resource, options) {
            if (this.readShouldThrowError) {
                throw this.readShouldThrowError;
            }
            this.lastReadFileUri = resource;
            return {
                ...(0, workbenchTestServices_1.createFileStat)(resource, this.readonly),
                value: buffer_1.VSBuffer.fromString(this.content)
            };
        }
        async readFileStream(resource, options) {
            if (this.readShouldThrowError) {
                throw this.readShouldThrowError;
            }
            this.lastReadFileUri = resource;
            return {
                ...(0, workbenchTestServices_1.createFileStat)(resource, this.readonly),
                value: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString(this.content))
            };
        }
        async writeFile(resource, bufferOrReadable, options) {
            await (0, async_1.timeout)(0);
            if (this.writeShouldThrowError) {
                throw this.writeShouldThrowError;
            }
            return (0, workbenchTestServices_1.createFileStat)(resource, this.readonly);
        }
        move(_source, _target, _overwrite) { return Promise.resolve(null); }
        copy(_source, _target, _overwrite) { return Promise.resolve(null); }
        async cloneFile(_source, _target) { }
        createFile(_resource, _content, _options) { return Promise.resolve(null); }
        createFolder(_resource) { return Promise.resolve(null); }
        registerProvider(scheme, provider) {
            this.providers.set(scheme, provider);
            return (0, lifecycle_2.toDisposable)(() => this.providers.delete(scheme));
        }
        getProvider(scheme) {
            return this.providers.get(scheme);
        }
        async activateProvider(_scheme) { return; }
        async canHandleResource(resource) { return this.hasProvider(resource); }
        hasProvider(resource) { return resource.scheme === network_1.Schemas.file || this.providers.has(resource.scheme); }
        listCapabilities() {
            return [
                { scheme: network_1.Schemas.file, capabilities: 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ },
                ...iterator_1.Iterable.map(this.providers, ([scheme, p]) => { return { scheme, capabilities: p.capabilities }; })
            ];
        }
        hasCapability(resource, capability) {
            if (capability === 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */ && platform_1.isLinux) {
                return true;
            }
            const provider = this.getProvider(resource.scheme);
            return !!(provider && (provider.capabilities & capability));
        }
        async del(_resource, _options) { }
        watch(_resource) {
            this.watches.push(_resource);
            return (0, lifecycle_2.toDisposable)(() => this.watches.splice(this.watches.indexOf(_resource), 1));
        }
        getWriteEncoding(_resource) { return { encoding: 'utf8', hasBOM: false }; }
        dispose() { }
        async canCreateFile(source, options) { return true; }
        async canMove(source, target, overwrite) { return true; }
        async canCopy(source, target, overwrite) { return true; }
        async canDelete(resource, options) { return true; }
    }
    exports.TestFileService = TestFileService;
    class TestWorkingCopyBackupService extends workingCopyBackupService_1.InMemoryWorkingCopyBackupService {
        constructor() {
            super();
            this.resolved = new Set();
        }
        parseBackupContent(textBufferFactory) {
            const textBuffer = textBufferFactory.create(1 /* DefaultEndOfLine.LF */).textBuffer;
            const lineCount = textBuffer.getLineCount();
            const range = new range_1.Range(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
            return textBuffer.getValueInRange(range, 0 /* EndOfLinePreference.TextDefined */);
        }
        async resolve(identifier) {
            this.resolved.add(identifier);
            return super.resolve(identifier);
        }
    }
    exports.TestWorkingCopyBackupService = TestWorkingCopyBackupService;
    function toUntypedWorkingCopyId(resource) {
        return toTypedWorkingCopyId(resource, '');
    }
    exports.toUntypedWorkingCopyId = toUntypedWorkingCopyId;
    function toTypedWorkingCopyId(resource, typeId = 'testBackupTypeId') {
        return { typeId, resource };
    }
    exports.toTypedWorkingCopyId = toTypedWorkingCopyId;
    class InMemoryTestWorkingCopyBackupService extends workingCopyBackupService_2.BrowserWorkingCopyBackupService {
        constructor() {
            const disposables = new lifecycle_2.DisposableStore();
            const environmentService = exports.TestEnvironmentService;
            const logService = new log_1.NullLogService();
            const fileService = disposables.add(new fileService_1.FileService(logService));
            disposables.add(fileService.registerProvider(network_1.Schemas.file, disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider())));
            disposables.add(fileService.registerProvider(network_1.Schemas.vscodeUserData, disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider())));
            super(new workbenchTestServices_1.TestContextService(testWorkspace_1.TestWorkspace), environmentService, fileService, logService);
            this.backupResourceJoiners = [];
            this.discardBackupJoiners = [];
            this.discardedBackups = [];
            this._register(disposables);
        }
        testGetFileService() {
            return this.fileService;
        }
        joinBackupResource() {
            return new Promise(resolve => this.backupResourceJoiners.push(resolve));
        }
        joinDiscardBackup() {
            return new Promise(resolve => this.discardBackupJoiners.push(resolve));
        }
        async backup(identifier, content, versionId, meta, token) {
            await super.backup(identifier, content, versionId, meta, token);
            while (this.backupResourceJoiners.length) {
                this.backupResourceJoiners.pop()();
            }
        }
        async discardBackup(identifier) {
            await super.discardBackup(identifier);
            this.discardedBackups.push(identifier);
            while (this.discardBackupJoiners.length) {
                this.discardBackupJoiners.pop()();
            }
        }
        async getBackupContents(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const fileContents = await this.fileService.readFile(backupResource);
            return fileContents.value.toString();
        }
    }
    exports.InMemoryTestWorkingCopyBackupService = InMemoryTestWorkingCopyBackupService;
    class TestLifecycleService extends lifecycle_2.Disposable {
        constructor() {
            super(...arguments);
            this._onBeforeShutdown = this._register(new event_1.Emitter());
            this._onBeforeShutdownError = this._register(new event_1.Emitter());
            this._onShutdownVeto = this._register(new event_1.Emitter());
            this._onWillShutdown = this._register(new event_1.Emitter());
            this._onDidShutdown = this._register(new event_1.Emitter());
            this.shutdownJoiners = [];
        }
        get onBeforeShutdown() { return this._onBeforeShutdown.event; }
        get onBeforeShutdownError() { return this._onBeforeShutdownError.event; }
        get onShutdownVeto() { return this._onShutdownVeto.event; }
        get onWillShutdown() { return this._onWillShutdown.event; }
        get onDidShutdown() { return this._onDidShutdown.event; }
        async when() { }
        fireShutdown(reason = 2 /* ShutdownReason.QUIT */) {
            this.shutdownJoiners = [];
            this._onWillShutdown.fire({
                join: p => {
                    this.shutdownJoiners.push(p);
                },
                joiners: () => [],
                force: () => { },
                token: cancellation_1.CancellationToken.None,
                reason
            });
        }
        fireBeforeShutdown(event) { this._onBeforeShutdown.fire(event); }
        fireWillShutdown(event) { this._onWillShutdown.fire(event); }
        async shutdown() {
            this.fireShutdown();
        }
    }
    exports.TestLifecycleService = TestLifecycleService;
    class TestBeforeShutdownEvent {
        constructor() {
            this.reason = 1 /* ShutdownReason.CLOSE */;
        }
        veto(value) {
            this.value = value;
        }
        finalVeto(vetoFn) {
            this.value = vetoFn();
            this.finalValue = vetoFn;
        }
    }
    exports.TestBeforeShutdownEvent = TestBeforeShutdownEvent;
    class TestWillShutdownEvent {
        constructor() {
            this.value = [];
            this.joiners = () => [];
            this.reason = 1 /* ShutdownReason.CLOSE */;
            this.token = cancellation_1.CancellationToken.None;
        }
        join(promise, joiner) {
            this.value.push(promise);
        }
        force() { }
    }
    exports.TestWillShutdownEvent = TestWillShutdownEvent;
    class TestTextResourceConfigurationService {
        constructor(configurationService = new testConfigurationService_1.TestConfigurationService()) {
            this.configurationService = configurationService;
        }
        onDidChangeConfiguration() {
            return { dispose() { } };
        }
        getValue(resource, arg2, arg3) {
            const position = position_1.Position.isIPosition(arg2) ? arg2 : null;
            const section = position ? (typeof arg3 === 'string' ? arg3 : undefined) : (typeof arg2 === 'string' ? arg2 : undefined);
            return this.configurationService.getValue(section, { resource });
        }
        inspect(resource, position, section) {
            return this.configurationService.inspect(section, { resource });
        }
        updateValue(resource, key, value, configurationTarget) {
            return this.configurationService.updateValue(key, value);
        }
    }
    exports.TestTextResourceConfigurationService = TestTextResourceConfigurationService;
    class RemoteFileSystemProvider {
        constructor(wrappedFsp, remoteAuthority) {
            this.wrappedFsp = wrappedFsp;
            this.remoteAuthority = remoteAuthority;
            this.capabilities = this.wrappedFsp.capabilities;
            this.onDidChangeCapabilities = this.wrappedFsp.onDidChangeCapabilities;
            this.onDidChangeFile = event_1.Event.map(this.wrappedFsp.onDidChangeFile, changes => changes.map((c) => {
                return {
                    type: c.type,
                    resource: c.resource.with({ scheme: network_1.Schemas.vscodeRemote, authority: this.remoteAuthority }),
                };
            }));
        }
        watch(resource, opts) { return this.wrappedFsp.watch(this.toFileResource(resource), opts); }
        stat(resource) { return this.wrappedFsp.stat(this.toFileResource(resource)); }
        mkdir(resource) { return this.wrappedFsp.mkdir(this.toFileResource(resource)); }
        readdir(resource) { return this.wrappedFsp.readdir(this.toFileResource(resource)); }
        delete(resource, opts) { return this.wrappedFsp.delete(this.toFileResource(resource), opts); }
        rename(from, to, opts) { return this.wrappedFsp.rename(this.toFileResource(from), this.toFileResource(to), opts); }
        copy(from, to, opts) { return this.wrappedFsp.copy(this.toFileResource(from), this.toFileResource(to), opts); }
        readFile(resource) { return this.wrappedFsp.readFile(this.toFileResource(resource)); }
        writeFile(resource, content, opts) { return this.wrappedFsp.writeFile(this.toFileResource(resource), content, opts); }
        open(resource, opts) { return this.wrappedFsp.open(this.toFileResource(resource), opts); }
        close(fd) { return this.wrappedFsp.close(fd); }
        read(fd, pos, data, offset, length) { return this.wrappedFsp.read(fd, pos, data, offset, length); }
        write(fd, pos, data, offset, length) { return this.wrappedFsp.write(fd, pos, data, offset, length); }
        readFileStream(resource, opts, token) { return this.wrappedFsp.readFileStream(this.toFileResource(resource), opts, token); }
        toFileResource(resource) { return resource.with({ scheme: network_1.Schemas.file, authority: '' }); }
    }
    exports.RemoteFileSystemProvider = RemoteFileSystemProvider;
    class TestInMemoryFileSystemProvider extends inMemoryFilesystemProvider_1.InMemoryFileSystemProvider {
        get capabilities() {
            return 2 /* FileSystemProviderCapabilities.FileReadWrite */
                | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */
                | 16 /* FileSystemProviderCapabilities.FileReadStream */;
        }
        readFileStream(resource) {
            const BUFFER_SIZE = 64 * 1024;
            const stream = (0, stream_1.newWriteableStream)(data => buffer_1.VSBuffer.concat(data.map(data => buffer_1.VSBuffer.wrap(data))).buffer);
            (async () => {
                try {
                    const data = await this.readFile(resource);
                    let offset = 0;
                    while (offset < data.length) {
                        await (0, async_1.timeout)(0);
                        await stream.write(data.subarray(offset, offset + BUFFER_SIZE));
                        offset += BUFFER_SIZE;
                    }
                    await (0, async_1.timeout)(0);
                    stream.end();
                }
                catch (error) {
                    stream.end(error);
                }
            })();
            return stream;
        }
    }
    exports.TestInMemoryFileSystemProvider = TestInMemoryFileSystemProvider;
    exports.productService = { _serviceBrand: undefined, ...product_1.default };
    class TestHostService {
        constructor() {
            this._hasFocus = true;
            this._onDidChangeFocus = new event_1.Emitter();
            this.onDidChangeFocus = this._onDidChangeFocus.event;
            this.colorScheme = theme_1.ColorScheme.DARK;
            this.onDidChangeColorScheme = event_1.Event.None;
        }
        get hasFocus() { return this._hasFocus; }
        async hadLastFocus() { return this._hasFocus; }
        setFocus(focus) {
            this._hasFocus = focus;
            this._onDidChangeFocus.fire(this._hasFocus);
        }
        async restart() { }
        async reload() { }
        async close() { }
        async withExpectedShutdown(expectedShutdownTask) {
            return await expectedShutdownTask();
        }
        async focus(options) { }
        async openWindow(arg1, arg2) { }
        async toggleFullScreen() { }
    }
    exports.TestHostService = TestHostService;
    class TestFilesConfigurationService extends filesConfigurationService_1.FilesConfigurationService {
        testOnFilesConfigurationChange(configuration) {
            super.onFilesConfigurationChange(configuration);
        }
    }
    exports.TestFilesConfigurationService = TestFilesConfigurationService;
    class TestReadonlyTextFileEditorModel extends textFileEditorModel_1.TextFileEditorModel {
        isReadonly() {
            return true;
        }
    }
    exports.TestReadonlyTextFileEditorModel = TestReadonlyTextFileEditorModel;
    class TestEditorInput extends editorInput_1.EditorInput {
        constructor(resource, _typeId) {
            super();
            this.resource = resource;
            this._typeId = _typeId;
        }
        get typeId() {
            return this._typeId;
        }
        get editorId() {
            return this._typeId;
        }
        resolve() {
            return Promise.resolve(null);
        }
    }
    exports.TestEditorInput = TestEditorInput;
    function registerTestEditor(id, inputs, serializerInputId) {
        const disposables = new lifecycle_2.DisposableStore();
        class TestEditor extends editorPane_1.EditorPane {
            constructor() {
                super(id, telemetryUtils_1.NullTelemetryService, new testThemeService_1.TestThemeService(), disposables.add(new workbenchTestServices_1.TestStorageService()));
                this._scopedContextKeyService = new mockKeybindingService_1.MockContextKeyService();
            }
            async setInput(input, options, context, token) {
                super.setInput(input, options, context, token);
                await input.resolve();
            }
            getId() { return id; }
            layout() { }
            createEditor() { }
            get scopedContextKeyService() {
                return this._scopedContextKeyService;
            }
        }
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_2.EditorPaneDescriptor.create(TestEditor, id, 'Test Editor Control'), inputs));
        if (serializerInputId) {
            class EditorsObserverTestEditorInputSerializer {
                canSerialize(editorInput) {
                    return true;
                }
                serialize(editorInput) {
                    const testEditorInput = editorInput;
                    const testInput = {
                        resource: testEditorInput.resource.toString()
                    };
                    return JSON.stringify(testInput);
                }
                deserialize(instantiationService, serializedEditorInput) {
                    const testInput = JSON.parse(serializedEditorInput);
                    return new TestFileEditorInput(uri_1.URI.parse(testInput.resource), serializerInputId);
                }
            }
            disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer(serializerInputId, EditorsObserverTestEditorInputSerializer));
        }
        return disposables;
    }
    exports.registerTestEditor = registerTestEditor;
    function registerTestFileEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_2.EditorPaneDescriptor.create(TestTextFileEditor, TestTextFileEditor.ID, 'Text File Editor'), [new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)]));
        return disposables;
    }
    exports.registerTestFileEditor = registerTestFileEditor;
    function registerTestResourceEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_2.EditorPaneDescriptor.create(TestTextResourceEditor, TestTextResourceEditor.ID, 'Text Editor'), [
            new descriptors_1.SyncDescriptor(untitledTextEditorInput_1.UntitledTextEditorInput),
            new descriptors_1.SyncDescriptor(textResourceEditorInput_1.TextResourceEditorInput)
        ]));
        return disposables;
    }
    exports.registerTestResourceEditor = registerTestResourceEditor;
    function registerTestSideBySideEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_2.EditorPaneDescriptor.create(sideBySideEditor_1.SideBySideEditor, sideBySideEditor_1.SideBySideEditor.ID, 'Text Editor'), [
            new descriptors_1.SyncDescriptor(sideBySideEditorInput_1.SideBySideEditorInput)
        ]));
        return disposables;
    }
    exports.registerTestSideBySideEditor = registerTestSideBySideEditor;
    class TestFileEditorInput extends editorInput_1.EditorInput {
        constructor(resource, _typeId) {
            super();
            this.resource = resource;
            this._typeId = _typeId;
            this.preferredResource = this.resource;
            this.gotDisposed = false;
            this.gotSaved = false;
            this.gotSavedAs = false;
            this.gotReverted = false;
            this.dirty = false;
            this.fails = false;
            this.disableToUntyped = false;
            this._capabilities = 0 /* EditorInputCapabilities.None */;
            this.movedEditor = undefined;
        }
        get typeId() { return this._typeId; }
        get editorId() { return this._typeId; }
        get capabilities() { return this._capabilities; }
        set capabilities(capabilities) {
            if (this._capabilities !== capabilities) {
                this._capabilities = capabilities;
                this._onDidChangeCapabilities.fire();
            }
        }
        resolve() { return !this.fails ? Promise.resolve(null) : Promise.reject(new Error('fails')); }
        matches(other) {
            if (super.matches(other)) {
                return true;
            }
            if (other instanceof editorInput_1.EditorInput) {
                return !!(other?.resource && this.resource.toString() === other.resource.toString() && other instanceof TestFileEditorInput && other.typeId === this.typeId);
            }
            return (0, resources_1.isEqual)(this.resource, other.resource) && (this.editorId === other.options?.override || other.options?.override === undefined);
        }
        setPreferredResource(resource) { }
        async setEncoding(encoding) { }
        getEncoding() { return undefined; }
        setPreferredName(name) { }
        setPreferredDescription(description) { }
        setPreferredEncoding(encoding) { }
        setPreferredContents(contents) { }
        setLanguageId(languageId, source) { }
        setPreferredLanguageId(languageId) { }
        setForceOpenAsBinary() { }
        setFailToOpen() {
            this.fails = true;
        }
        async save(groupId, options) {
            this.gotSaved = true;
            this.dirty = false;
            return this;
        }
        async saveAs(groupId, options) {
            this.gotSavedAs = true;
            return this;
        }
        async revert(group, options) {
            this.gotReverted = true;
            this.gotSaved = false;
            this.gotSavedAs = false;
            this.dirty = false;
        }
        toUntyped() {
            if (this.disableToUntyped) {
                return undefined;
            }
            return { resource: this.resource };
        }
        setModified() { this.modified = true; }
        isModified() {
            return this.modified === undefined ? this.dirty : this.modified;
        }
        setDirty() { this.dirty = true; }
        isDirty() {
            return this.dirty;
        }
        isResolved() { return false; }
        dispose() {
            super.dispose();
            this.gotDisposed = true;
        }
        async rename() { return this.movedEditor; }
    }
    exports.TestFileEditorInput = TestFileEditorInput;
    class TestSingletonFileEditorInput extends TestFileEditorInput {
        get capabilities() { return 8 /* EditorInputCapabilities.Singleton */; }
    }
    exports.TestSingletonFileEditorInput = TestSingletonFileEditorInput;
    class TestEditorPart extends editorPart_1.EditorPart {
        testSaveState() {
            return super.saveState();
        }
        clearState() {
            const workspaceMemento = this.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            for (const key of Object.keys(workspaceMemento)) {
                delete workspaceMemento[key];
            }
            const profileMemento = this.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            for (const key of Object.keys(profileMemento)) {
                delete profileMemento[key];
            }
        }
    }
    exports.TestEditorPart = TestEditorPart;
    async function createEditorPart(instantiationService, disposables) {
        const part = disposables.add(instantiationService.createInstance(TestEditorPart));
        part.create(document.createElement('div'));
        part.layout(1080, 800, 0, 0);
        await part.whenReady;
        return part;
    }
    exports.createEditorPart = createEditorPart;
    class TestListService {
        constructor() {
            this.lastFocusedList = undefined;
        }
        register() {
            return lifecycle_2.Disposable.None;
        }
    }
    exports.TestListService = TestListService;
    class TestPathService {
        constructor(fallbackUserHome = uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/' }), defaultUriScheme = network_1.Schemas.file) {
            this.fallbackUserHome = fallbackUserHome;
            this.defaultUriScheme = defaultUriScheme;
        }
        hasValidBasename(resource, arg2, name) {
            if (typeof arg2 === 'string' || typeof arg2 === 'undefined') {
                return (0, extpath_1.isValidBasename)(arg2 ?? (0, resources_1.basename)(resource));
            }
            return (0, extpath_1.isValidBasename)(name ?? (0, resources_1.basename)(resource));
        }
        get path() { return Promise.resolve(platform_1.isWindows ? path_1.win32 : path_1.posix); }
        userHome(options) {
            return options?.preferLocal ? this.fallbackUserHome : Promise.resolve(this.fallbackUserHome);
        }
        get resolvedUserHome() { return this.fallbackUserHome; }
        async fileURI(path) {
            return uri_1.URI.file(path);
        }
    }
    exports.TestPathService = TestPathService;
    function getLastResolvedFileStat(model) {
        const candidate = model;
        return candidate?.lastResolvedFileStat;
    }
    exports.getLastResolvedFileStat = getLastResolvedFileStat;
    class TestWorkspacesService {
        constructor() {
            this.onDidChangeRecentlyOpened = event_1.Event.None;
        }
        async createUntitledWorkspace(folders, remoteAuthority) { throw new Error('Method not implemented.'); }
        async deleteUntitledWorkspace(workspace) { }
        async addRecentlyOpened(recents) { }
        async removeRecentlyOpened(workspaces) { }
        async clearRecentlyOpened() { }
        async getRecentlyOpened() { return { files: [], workspaces: [] }; }
        async getDirtyWorkspaces() { return []; }
        async enterWorkspace(path) { throw new Error('Method not implemented.'); }
        async getWorkspaceIdentifier(workspacePath) { throw new Error('Method not implemented.'); }
    }
    exports.TestWorkspacesService = TestWorkspacesService;
    class TestTerminalInstanceService {
        constructor() {
            this.onDidCreateInstance = event_1.Event.None;
        }
        convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd) { throw new Error('Method not implemented.'); }
        preparePathForTerminalAsync(path, executable, title, shellType, remoteAuthority) { throw new Error('Method not implemented.'); }
        createInstance(options, target) { throw new Error('Method not implemented.'); }
        async getBackend(remoteAuthority) { throw new Error('Method not implemented.'); }
        didRegisterBackend(remoteAuthority) { throw new Error('Method not implemented.'); }
        getRegisteredBackends() { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalInstanceService = TestTerminalInstanceService;
    class TestTerminalEditorService {
        constructor() {
            this.instances = [];
            this.onDidDisposeInstance = event_1.Event.None;
            this.onDidFocusInstance = event_1.Event.None;
            this.onDidChangeInstanceCapability = event_1.Event.None;
            this.onDidChangeActiveInstance = event_1.Event.None;
            this.onDidChangeInstances = event_1.Event.None;
        }
        openEditor(instance, editorOptions) { throw new Error('Method not implemented.'); }
        detachInstance(instance) { throw new Error('Method not implemented.'); }
        splitInstance(instanceToSplit, shellLaunchConfig) { throw new Error('Method not implemented.'); }
        revealActiveEditor(preserveFocus) { throw new Error('Method not implemented.'); }
        resolveResource(instance) { throw new Error('Method not implemented.'); }
        reviveInput(deserializedInput) { throw new Error('Method not implemented.'); }
        getInputFromResource(resource) { throw new Error('Method not implemented.'); }
        setActiveInstance(instance) { throw new Error('Method not implemented.'); }
        focusActiveInstance() { throw new Error('Method not implemented.'); }
        getInstanceFromResource(resource) { throw new Error('Method not implemented.'); }
        focusFindWidget() { throw new Error('Method not implemented.'); }
        hideFindWidget() { throw new Error('Method not implemented.'); }
        findNext() { throw new Error('Method not implemented.'); }
        findPrevious() { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalEditorService = TestTerminalEditorService;
    class TestTerminalGroupService {
        constructor() {
            this.instances = [];
            this.groups = [];
            this.activeGroupIndex = 0;
            this.lastAccessedMenu = 'inline-tab';
            this.onDidChangeActiveGroup = event_1.Event.None;
            this.onDidDisposeGroup = event_1.Event.None;
            this.onDidShow = event_1.Event.None;
            this.onDidChangeGroups = event_1.Event.None;
            this.onDidChangePanelOrientation = event_1.Event.None;
            this.onDidDisposeInstance = event_1.Event.None;
            this.onDidFocusInstance = event_1.Event.None;
            this.onDidChangeInstanceCapability = event_1.Event.None;
            this.onDidChangeActiveInstance = event_1.Event.None;
            this.onDidChangeInstances = event_1.Event.None;
        }
        createGroup(instance) { throw new Error('Method not implemented.'); }
        getGroupForInstance(instance) { throw new Error('Method not implemented.'); }
        moveGroup(source, target) { throw new Error('Method not implemented.'); }
        moveGroupToEnd(source) { throw new Error('Method not implemented.'); }
        moveInstance(source, target, side) { throw new Error('Method not implemented.'); }
        unsplitInstance(instance) { throw new Error('Method not implemented.'); }
        joinInstances(instances) { throw new Error('Method not implemented.'); }
        instanceIsSplit(instance) { throw new Error('Method not implemented.'); }
        getGroupLabels() { throw new Error('Method not implemented.'); }
        setActiveGroupByIndex(index) { throw new Error('Method not implemented.'); }
        setActiveGroupToNext() { throw new Error('Method not implemented.'); }
        setActiveGroupToPrevious() { throw new Error('Method not implemented.'); }
        setActiveInstanceByIndex(terminalIndex) { throw new Error('Method not implemented.'); }
        setContainer(container) { throw new Error('Method not implemented.'); }
        showPanel(focus) { throw new Error('Method not implemented.'); }
        hidePanel() { throw new Error('Method not implemented.'); }
        focusTabs() { throw new Error('Method not implemented.'); }
        focusHover() { throw new Error('Method not implemented.'); }
        setActiveInstance(instance) { throw new Error('Method not implemented.'); }
        focusActiveInstance() { throw new Error('Method not implemented.'); }
        getInstanceFromResource(resource) { throw new Error('Method not implemented.'); }
        focusFindWidget() { throw new Error('Method not implemented.'); }
        hideFindWidget() { throw new Error('Method not implemented.'); }
        findNext() { throw new Error('Method not implemented.'); }
        findPrevious() { throw new Error('Method not implemented.'); }
        updateVisibility() { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalGroupService = TestTerminalGroupService;
    class TestTerminalProfileService {
        constructor() {
            this.availableProfiles = [];
            this.contributedProfiles = [];
            this.profilesReady = Promise.resolve();
            this.onDidChangeAvailableProfiles = event_1.Event.None;
        }
        getPlatformKey() { throw new Error('Method not implemented.'); }
        refreshAvailableProfiles() { throw new Error('Method not implemented.'); }
        getDefaultProfileName() { throw new Error('Method not implemented.'); }
        getDefaultProfile() { throw new Error('Method not implemented.'); }
        getContributedDefaultProfile(shellLaunchConfig) { throw new Error('Method not implemented.'); }
        registerContributedProfile(args) { throw new Error('Method not implemented.'); }
        getContributedProfileProvider(extensionIdentifier, id) { throw new Error('Method not implemented.'); }
        registerTerminalProfileProvider(extensionIdentifier, id, profileProvider) { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalProfileService = TestTerminalProfileService;
    class TestTerminalProfileResolverService {
        constructor() {
            this.defaultProfileName = '';
        }
        resolveIcon(shellLaunchConfig) { }
        async resolveShellLaunchConfig(shellLaunchConfig, options) { }
        async getDefaultProfile(options) { return { path: '/default', profileName: 'Default', isDefault: true }; }
        async getDefaultShell(options) { return '/default'; }
        async getDefaultShellArgs(options) { return []; }
        getDefaultIcon() { return codicons_1.Codicon.terminal; }
        async getEnvironment() { return process_1.env; }
        getSafeConfigValue(key, os) { return undefined; }
        getSafeConfigValueFullKey(key) { return undefined; }
        createProfileFromShellAndShellArgs(shell, shellArgs) { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalProfileResolverService = TestTerminalProfileResolverService;
    class TestQuickInputService {
        constructor() {
            this.onShow = event_1.Event.None;
            this.onHide = event_1.Event.None;
            this.quickAccess = undefined;
        }
        async pick(picks, options, token) {
            if (Array.isArray(picks)) {
                return { label: 'selectedPick', description: 'pick description', value: 'selectedPick' };
            }
            else {
                return undefined;
            }
        }
        async input(options, token) { return options ? 'resolved' + options.prompt : 'resolved'; }
        createQuickPick() { throw new Error('not implemented.'); }
        createInputBox() { throw new Error('not implemented.'); }
        createQuickWidget() { throw new Error('Method not implemented.'); }
        focus() { throw new Error('not implemented.'); }
        toggle() { throw new Error('not implemented.'); }
        navigate(next, quickNavigate) { throw new Error('not implemented.'); }
        accept() { throw new Error('not implemented.'); }
        back() { throw new Error('not implemented.'); }
        cancel() { throw new Error('not implemented.'); }
    }
    exports.TestQuickInputService = TestQuickInputService;
    class TestLanguageDetectionService {
        isEnabledForLanguage(languageId) { return false; }
        async detectLanguage(resource, supportedLangs) { return undefined; }
    }
    class TestRemoteAgentService {
        getConnection() { return null; }
        async getEnvironment() { return null; }
        async getRawEnvironment() { return null; }
        async getExtensionHostExitInfo(reconnectionToken) { return null; }
        async getDiagnosticInfo(options) { return undefined; }
        async updateTelemetryLevel(telemetryLevel) { }
        async logTelemetry(eventName, data) { }
        async flushTelemetry() { }
        async getRoundTripTime() { return undefined; }
    }
    exports.TestRemoteAgentService = TestRemoteAgentService;
    class TestRemoteExtensionsScannerService {
        async whenExtensionsReady() { }
        scanExtensions() { throw new Error('Method not implemented.'); }
        scanSingleExtension() { throw new Error('Method not implemented.'); }
    }
    exports.TestRemoteExtensionsScannerService = TestRemoteExtensionsScannerService;
    class TestWorkbenchExtensionEnablementService {
        constructor() {
            this.onEnablementChanged = event_1.Event.None;
        }
        getEnablementState(extension) { return 8 /* EnablementState.EnabledGlobally */; }
        getEnablementStates(extensions, workspaceTypeOverrides) { return []; }
        getDependenciesEnablementStates(extension) { return []; }
        canChangeEnablement(extension) { return true; }
        canChangeWorkspaceEnablement(extension) { return true; }
        isEnabled(extension) { return true; }
        isEnabledEnablementState(enablementState) { return true; }
        isDisabledGlobally(extension) { return false; }
        async setEnablement(extensions, state) { return []; }
        async updateExtensionsEnablementsWhenWorkspaceTrustChanges() { }
    }
    exports.TestWorkbenchExtensionEnablementService = TestWorkbenchExtensionEnablementService;
    class TestWorkbenchExtensionManagementService {
        constructor() {
            this.onInstallExtension = event_1.Event.None;
            this.onDidInstallExtensions = event_1.Event.None;
            this.onUninstallExtension = event_1.Event.None;
            this.onDidUninstallExtension = event_1.Event.None;
            this.onDidUpdateExtensionMetadata = event_1.Event.None;
            this.onProfileAwareInstallExtension = event_1.Event.None;
            this.onProfileAwareDidInstallExtensions = event_1.Event.None;
            this.onProfileAwareUninstallExtension = event_1.Event.None;
            this.onProfileAwareDidUninstallExtension = event_1.Event.None;
            this.onDidChangeProfile = event_1.Event.None;
        }
        installVSIX(location, manifest, installOptions) {
            throw new Error('Method not implemented.');
        }
        installFromLocation(location) {
            throw new Error('Method not implemented.');
        }
        installGalleryExtensions(extensions) {
            throw new Error('Method not implemented.');
        }
        async updateFromGallery(gallery, extension, installOptions) { return extension; }
        zip(extension) {
            throw new Error('Method not implemented.');
        }
        unzip(zipLocation) {
            throw new Error('Method not implemented.');
        }
        getManifest(vsix) {
            throw new Error('Method not implemented.');
        }
        install(vsix, options) {
            throw new Error('Method not implemented.');
        }
        async canInstall(extension) { return false; }
        installFromGallery(extension, options) {
            throw new Error('Method not implemented.');
        }
        uninstall(extension, options) {
            throw new Error('Method not implemented.');
        }
        async reinstallFromGallery(extension) {
            throw new Error('Method not implemented.');
        }
        async getInstalled(type) { return []; }
        getExtensionsControlManifest() {
            throw new Error('Method not implemented.');
        }
        async updateMetadata(local, metadata) { return local; }
        registerParticipant(pariticipant) { }
        async getTargetPlatform() { return "undefined" /* TargetPlatform.UNDEFINED */; }
        async cleanUp() { }
        download() {
            throw new Error('Method not implemented.');
        }
        copyExtensions() { throw new Error('Not Supported'); }
        toggleAppliationScope() { throw new Error('Not Supported'); }
        installExtensionsFromProfile() { throw new Error('Not Supported'); }
        whenProfileChanged(from, to) { throw new Error('Not Supported'); }
    }
    exports.TestWorkbenchExtensionManagementService = TestWorkbenchExtensionManagementService;
    class TestUserDataProfileService {
        constructor() {
            this.onDidChangeCurrentProfile = event_1.Event.None;
            this.currentProfile = (0, userDataProfile_1.toUserDataProfile)('test', 'test', uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }));
        }
        async updateCurrentProfile() { }
        getShortName(profile) { return profile.shortName ?? profile.name; }
    }
    exports.TestUserDataProfileService = TestUserDataProfileService;
    class TestWebExtensionsScannerService {
        constructor() {
            this.onDidChangeProfile = event_1.Event.None;
        }
        async scanSystemExtensions() { return []; }
        async scanUserExtensions() { return []; }
        async scanExtensionsUnderDevelopment() { return []; }
        async copyExtensions() {
            throw new Error('Method not implemented.');
        }
        scanExistingExtension(extensionLocation, extensionType) {
            throw new Error('Method not implemented.');
        }
        addExtension(location, metadata) {
            throw new Error('Method not implemented.');
        }
        addExtensionFromGallery(galleryExtension, metadata) {
            throw new Error('Method not implemented.');
        }
        removeExtension() {
            throw new Error('Method not implemented.');
        }
        updateMetadata(extension, metaData, profileLocation) {
            throw new Error('Method not implemented.');
        }
        scanExtensionManifest(extensionLocation) {
            throw new Error('Method not implemented.');
        }
    }
    exports.TestWebExtensionsScannerService = TestWebExtensionsScannerService;
    async function workbenchTeardown(instantiationService) {
        return instantiationService.invokeFunction(async (accessor) => {
            const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            for (const workingCopy of workingCopyService.workingCopies) {
                await workingCopy.revert();
            }
            for (const group of editorGroupService.groups) {
                await group.closeAllEditors();
            }
            for (const group of editorGroupService.groups) {
                editorGroupService.removeGroup(group);
            }
        });
    }
    exports.workbenchTeardown = workbenchTeardown;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoVGVzdFNlcnZpY2VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3Rlc3QvYnJvd3Nlci93b3JrYmVuY2hUZXN0U2VydmljZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0toRyxTQUFnQixxQkFBcUIsQ0FBQyxvQkFBMkMsRUFBRSxRQUFhO1FBQy9GLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlDQUFlLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDekksQ0FBQztJQUZELHNEQUVDO0lBRUQsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLHlCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLHlCQUF5QixDQUFDO1FBRTdGLE1BQU0sRUFBRSw0QkFBb0I7UUFFNUIsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLG9CQUFvQixFQUFvQixFQUFFO1lBQ3pMLE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlDQUFlLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzFMLENBQUM7UUFFRCxZQUFZLEVBQUUsQ0FBQyxHQUFHLEVBQTJCLEVBQUU7WUFDOUMsT0FBTyxHQUFHLFlBQVksaUNBQWUsQ0FBQztRQUN2QyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsTUFBYSxzQkFBdUIsU0FBUSx1Q0FBa0I7UUFFMUMsbUJBQW1CLENBQUMsTUFBbUIsRUFBRSxhQUFrQjtZ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