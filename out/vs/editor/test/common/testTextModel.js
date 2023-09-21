/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/model/textModel", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/language", "vs/editor/common/services/languageService", "vs/editor/common/services/textResourceConfiguration", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/dialogs/common/dialogs", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService", "vs/editor/test/common/services/testTextResourcePropertiesService", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/platform/environment/common/environment", "vs/base/test/common/mock"], function (require, exports, lifecycle_1, textModel_1, languageConfigurationRegistry_1, language_1, languageService_1, textResourceConfiguration_1, testLanguageConfigurationService_1, configuration_1, testConfigurationService_1, dialogs_1, testDialogService_1, log_1, notification_1, testNotificationService_1, themeService_1, testThemeService_1, undoRedo_1, undoRedoService_1, testTextResourcePropertiesService_1, model_1, modelService_1, instantiationServiceMock_1, modesRegistry_1, languageFeatureDebounce_1, languageFeatures_1, languageFeaturesService_1, environment_1, mock_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createModelServices = exports.instantiateTextModel = exports.createTextModel = exports.withEditorModel = void 0;
    class TestTextModel extends textModel_1.TextModel {
        registerDisposable(disposable) {
            this._register(disposable);
        }
    }
    function withEditorModel(text, callback) {
        const model = createTextModel(text.join('\n'));
        callback(model);
        model.dispose();
    }
    exports.withEditorModel = withEditorModel;
    function resolveOptions(_options) {
        const defaultOptions = textModel_1.TextModel.DEFAULT_CREATION_OPTIONS;
        return {
            tabSize: (typeof _options.tabSize === 'undefined' ? defaultOptions.tabSize : _options.tabSize),
            indentSize: (typeof _options.indentSize === 'undefined' ? defaultOptions.indentSize : _options.indentSize),
            insertSpaces: (typeof _options.insertSpaces === 'undefined' ? defaultOptions.insertSpaces : _options.insertSpaces),
            detectIndentation: (typeof _options.detectIndentation === 'undefined' ? defaultOptions.detectIndentation : _options.detectIndentation),
            trimAutoWhitespace: (typeof _options.trimAutoWhitespace === 'undefined' ? defaultOptions.trimAutoWhitespace : _options.trimAutoWhitespace),
            defaultEOL: (typeof _options.defaultEOL === 'undefined' ? defaultOptions.defaultEOL : _options.defaultEOL),
            isForSimpleWidget: (typeof _options.isForSimpleWidget === 'undefined' ? defaultOptions.isForSimpleWidget : _options.isForSimpleWidget),
            largeFileOptimizations: (typeof _options.largeFileOptimizations === 'undefined' ? defaultOptions.largeFileOptimizations : _options.largeFileOptimizations),
            bracketPairColorizationOptions: (typeof _options.bracketColorizationOptions === 'undefined' ? defaultOptions.bracketPairColorizationOptions : _options.bracketColorizationOptions),
        };
    }
    function createTextModel(text, languageId = null, options = textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, uri = null) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = createModelServices(disposables);
        const model = instantiateTextModel(instantiationService, text, languageId, options, uri);
        model.registerDisposable(disposables);
        return model;
    }
    exports.createTextModel = createTextModel;
    function instantiateTextModel(instantiationService, text, languageId = null, _options = textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, uri = null) {
        const options = resolveOptions(_options);
        return instantiationService.createInstance(TestTextModel, text, languageId || modesRegistry_1.PLAINTEXT_LANGUAGE_ID, options, uri);
    }
    exports.instantiateTextModel = instantiateTextModel;
    function createModelServices(disposables, services = []) {
        return (0, instantiationServiceMock_1.createServices)(disposables, services.concat([
            [notification_1.INotificationService, testNotificationService_1.TestNotificationService],
            [dialogs_1.IDialogService, testDialogService_1.TestDialogService],
            [undoRedo_1.IUndoRedoService, undoRedoService_1.UndoRedoService],
            [language_1.ILanguageService, languageService_1.LanguageService],
            [languageConfigurationRegistry_1.ILanguageConfigurationService, testLanguageConfigurationService_1.TestLanguageConfigurationService],
            [configuration_1.IConfigurationService, testConfigurationService_1.TestConfigurationService],
            [textResourceConfiguration_1.ITextResourcePropertiesService, testTextResourcePropertiesService_1.TestTextResourcePropertiesService],
            [themeService_1.IThemeService, testThemeService_1.TestThemeService],
            [log_1.ILogService, log_1.NullLogService],
            [environment_1.IEnvironmentService, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.isBuilt = true;
                        this.isExtensionDevelopment = false;
                    }
                }],
            [languageFeatureDebounce_1.ILanguageFeatureDebounceService, languageFeatureDebounce_1.LanguageFeatureDebounceService],
            [languageFeatures_1.ILanguageFeaturesService, languageFeaturesService_1.LanguageFeaturesService],
            [model_1.IModelService, modelService_1.ModelService],
        ]));
    }
    exports.createModelServices = createModelServices;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFRleHRNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi90ZXN0VGV4dE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtDaEcsTUFBTSxhQUFjLFNBQVEscUJBQVM7UUFDN0Isa0JBQWtCLENBQUMsVUFBdUI7WUFDaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQ0Q7SUFFRCxTQUFnQixlQUFlLENBQUMsSUFBYyxFQUFFLFFBQW9DO1FBQ25GLE1BQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0MsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBSkQsMENBSUM7SUFjRCxTQUFTLGNBQWMsQ0FBQyxRQUEwQztRQUNqRSxNQUFNLGNBQWMsR0FBRyxxQkFBUyxDQUFDLHdCQUF3QixDQUFDO1FBQzFELE9BQU87WUFDTixPQUFPLEVBQUUsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQzlGLFVBQVUsRUFBRSxDQUFDLE9BQU8sUUFBUSxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFDMUcsWUFBWSxFQUFFLENBQUMsT0FBTyxRQUFRLENBQUMsWUFBWSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFlB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