/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/languageService", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/common/services/textResourceConfiguration", "vs/editor/test/browser/config/testConfiguration", "vs/editor/test/browser/editorTestServices", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/editor/test/common/services/testEditorWorkerService", "vs/editor/test/common/services/testTextResourcePropertiesService", "vs/editor/test/common/testTextModel", "vs/platform/accessibility/common/accessibility", "vs/platform/accessibility/test/common/testAccessibilityService", "vs/platform/clipboard/common/clipboardService", "vs/platform/clipboard/test/common/testClipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/opener/common/opener", "vs/platform/opener/test/common/nullOpenerService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService"], function (require, exports, lifecycle_1, mock_1, codeEditorService_1, codeEditorWidget_1, language_1, languageConfigurationRegistry_1, editorWorker_1, languageFeatureDebounce_1, languageFeatures_1, languageFeaturesService_1, languageService_1, model_1, modelService_1, textResourceConfiguration_1, testConfiguration_1, editorTestServices_1, testLanguageConfigurationService_1, testEditorWorkerService_1, testTextResourcePropertiesService_1, testTextModel_1, accessibility_1, testAccessibilityService_1, clipboardService_1, testClipboardService_1, commands_1, configuration_1, testConfigurationService_1, contextkey_1, dialogs_1, testDialogService_1, environment_1, descriptors_1, serviceCollection_1, instantiationServiceMock_1, keybinding_1, mockKeybindingService_1, log_1, notification_1, testNotificationService_1, opener_1, nullOpenerService_1, telemetry_1, telemetryUtils_1, themeService_1, testThemeService_1, undoRedo_1, undoRedoService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.instantiateTestCodeEditor = exports.createTestCodeEditor = exports.createCodeEditorServices = exports.withAsyncTestCodeEditor = exports.withTestCodeEditor = exports.TestCodeEditor = void 0;
    class TestCodeEditor extends codeEditorWidget_1.CodeEditorWidget {
        constructor() {
            super(...arguments);
            this._hasTextFocus = false;
        }
        //#region testing overrides
        _createConfiguration(isSimpleWidget, options) {
            return new testConfiguration_1.TestConfiguration(options);
        }
        _createView(viewModel) {
            // Never create a view
            return [null, false];
        }
        setHasTextFocus(hasTextFocus) {
            this._hasTextFocus = hasTextFocus;
        }
        hasTextFocus() {
            return this._hasTextFocus;
        }
        //#endregion
        //#region Testing utils
        getViewModel() {
            return this._modelData ? this._modelData.viewModel : undefined;
        }
        registerAndInstantiateContribution(id, ctor) {
            const r = this._instantiationService.createInstance(ctor, this);
            this._contributions.set(id, r);
            return r;
        }
        registerDisposable(disposable) {
            this._register(disposable);
        }
    }
    exports.TestCodeEditor = TestCodeEditor;
    class TestEditorDomElement {
        constructor() {
            this.parentElement = null;
            this.ownerDocument = document;
        }
        setAttribute(attr, value) { }
        removeAttribute(attr) { }
        hasAttribute(attr) { return false; }
        getAttribute(attr) { return undefined; }
        addEventListener(event) { }
        removeEventListener(event) { }
    }
    function withTestCodeEditor(text, options, callback) {
        return _withTestCodeEditor(text, options, callback);
    }
    exports.withTestCodeEditor = withTestCodeEditor;
    async function withAsyncTestCodeEditor(text, options, callback) {
        return _withTestCodeEditor(text, options, callback);
    }
    exports.withAsyncTestCodeEditor = withAsyncTestCodeEditor;
    function isTextModel(arg) {
        return Boolean(arg && arg.uri);
    }
    function _withTestCodeEditor(arg, options, callback) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = createCodeEditorServices(disposables, options.serviceCollection);
        delete options.serviceCollection;
        // create a model if necessary
        let model;
        if (isTextModel(arg)) {
            model = arg;
        }
        else {
            model = disposables.add((0, testTextModel_1.instantiateTextModel)(instantiationService, Array.isArray(arg) ? arg.join('\n') : arg));
        }
        const editor = disposables.add(instantiateTestCodeEditor(instantiationService, model, options));
        const viewModel = editor.getViewModel();
        viewModel.setHasFocus(true);
        const result = callback(editor, editor.getViewModel(), instantiationService);
        if (result) {
            return result.then(() => disposables.dispose());
        }
        disposables.dispose();
    }
    function createCodeEditorServices(disposables, services = new serviceCollection_1.ServiceCollection()) {
        const serviceIdentifiers = [];
        const define = (id, ctor) => {
            if (!services.has(id)) {
                services.set(id, new descriptors_1.SyncDescriptor(ctor));
            }
            serviceIdentifiers.push(id);
        };
        const defineInstance = (id, instance) => {
            if (!services.has(id)) {
                services.set(id, instance);
            }
            serviceIdentifiers.push(id);
        };
        define(accessibility_1.IAccessibilityService, testAccessibilityService_1.TestAccessibilityService);
        define(keybinding_1.IKeybindingService, mockKeybindingService_1.MockKeybindingService);
        define(clipboardService_1.IClipboardService, testClipboardService_1.TestClipboardService);
        define(editorWorker_1.IEditorWorkerService, testEditorWorkerService_1.TestEditorWorkerService);
        defineInstance(opener_1.IOpenerService, nullOpenerService_1.NullOpenerService);
        define(notification_1.INotificationService, testNotificationService_1.TestNotificationService);
        define(dialogs_1.IDialogService, testDialogService_1.TestDialogService);
        define(undoRedo_1.IUndoRedoService, undoRedoService_1.UndoRedoService);
        define(language_1.ILanguageService, languageService_1.LanguageService);
        define(languageConfigurationRegistry_1.ILanguageConfigurationService, testLanguageConfigurationService_1.TestLanguageConfigurationService);
        define(configuration_1.IConfigurationService, testConfigurationService_1.TestConfigurationService);
        define(textResourceConfiguration_1.ITextResourcePropertiesService, testTextResourcePropertiesService_1.TestTextResourcePropertiesService);
        define(themeService_1.IThemeService, testThemeService_1.TestThemeService);
        define(log_1.ILogService, log_1.NullLogService);
        define(model_1.IModelService, modelService_1.ModelService);
        define(codeEditorService_1.ICodeEditorService, editorTestServices_1.TestCodeEditorService);
        define(contextkey_1.IContextKeyService, mockKeybindingService_1.MockContextKeyService);
        define(commands_1.ICommandService, editorTestServices_1.TestCommandService);
        define(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryServiceShape);
        define(environment_1.IEnvironmentService, class extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.isBuilt = true;
                this.isExtensionDevelopment = false;
            }
        });
        define(languageFeatureDebounce_1.ILanguageFeatureDebounceService, languageFeatureDebounce_1.LanguageFeatureDebounceService);
        define(languageFeatures_1.ILanguageFeaturesService, languageFeaturesService_1.LanguageFeaturesService);
        const instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService(services, true));
        disposables.add((0, lifecycle_1.toDisposable)(() => {
            for (const id of serviceIdentifiers) {
                const instanceOrDescriptor = services.get(id);
                if (typeof instanceOrDescriptor.dispose === 'function') {
                    instanceOrDescriptor.dispose();
                }
            }
        }));
        return instantiationService;
    }
    exports.createCodeEditorServices = createCodeEditorServices;
    function createTestCodeEditor(model, options = {}) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = createCodeEditorServices(disposables, options.serviceCollection);
        delete options.serviceCollection;
        const editor = instantiateTestCodeEditor(instantiationService, model || null, options);
        editor.registerDisposable(disposables);
        return editor;
    }
    exports.createTestCodeEditor = createTestCodeEditor;
    function instantiateTestCodeEditor(instantiationService, model, options = {}) {
        const codeEditorWidgetOptions = {
            contributions: []
        };
        const editor = instantiationService.createInstance(TestCodeEditor, new TestEditorDomElement(), options, codeEditorWidgetOptions);
        if (typeof options.hasTextFocus === 'undefined') {
            options.hasTextFocus = true;
        }
        editor.setHasTextFocus(options.hasTextFocus);
        editor.setModel(model);
        const viewModel = editor.getViewModel();
        viewModel?.setHasFocus(options.hasTextFocus);
        return editor;
    }
    exports.instantiateTestCodeEditor = instantiateTestCodeEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvZGVFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9icm93c2VyL3Rlc3RDb2RlRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdFaEcsTUFBYSxjQUFlLFNBQVEsbUNBQWdCO1FBQXBEOztZQVVTLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBcUIvQixDQUFDO1FBN0JBLDJCQUEyQjtRQUNSLG9CQUFvQixDQUFDLGNBQXVCLEVBQUUsT0FBNkM7WUFDN0csT0FBTyxJQUFJLHFDQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDa0IsV0FBVyxDQUFDLFNBQW9CO1lBQ2xELHNCQUFzQjtZQUN0QixPQUFPLENBQUMsSUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTSxlQUFlLENBQUMsWUFBcUI7WUFDM0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFDbkMsQ0FBQztRQUNlLFlBQVk7WUFDM0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzNCLENBQUM7UUFDRCxZQUFZO1FBRVosdUJBQXVCO1FBQ2hCLFlBQVk7WUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ2hFLENBQUM7UUFDTSxrQ0FBa0MsQ0FBZ0MsRUFBVSxFQUFFLElBQW1FO1lBQ3ZKLE1BQU0sQ0FBQyxHQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQixPQUFPLENBQUMsQ0FBQztRQUNWLENB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