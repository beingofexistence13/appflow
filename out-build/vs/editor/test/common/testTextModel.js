/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/model/textModel", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/languages/language", "vs/editor/common/services/languageService", "vs/editor/common/services/textResourceConfiguration", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/dialogs/common/dialogs", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService", "vs/editor/test/common/services/testTextResourcePropertiesService", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/editor/common/languages/modesRegistry", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/platform/environment/common/environment", "vs/base/test/common/mock"], function (require, exports, lifecycle_1, textModel_1, languageConfigurationRegistry_1, language_1, languageService_1, textResourceConfiguration_1, testLanguageConfigurationService_1, configuration_1, testConfigurationService_1, dialogs_1, testDialogService_1, log_1, notification_1, testNotificationService_1, themeService_1, testThemeService_1, undoRedo_1, undoRedoService_1, testTextResourcePropertiesService_1, model_1, modelService_1, instantiationServiceMock_1, modesRegistry_1, languageFeatureDebounce_1, languageFeatures_1, languageFeaturesService_1, environment_1, mock_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q0b = exports.$P0b = exports.$O0b = exports.$N0b = void 0;
    class TestTextModel extends textModel_1.$MC {
        registerDisposable(disposable) {
            this.B(disposable);
        }
    }
    function $N0b(text, callback) {
        const model = $O0b(text.join('\n'));
        callback(model);
        model.dispose();
    }
    exports.$N0b = $N0b;
    function resolveOptions(_options) {
        const defaultOptions = textModel_1.$MC.DEFAULT_CREATION_OPTIONS;
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
    function $O0b(text, languageId = null, options = textModel_1.$MC.DEFAULT_CREATION_OPTIONS, uri = null) {
        const disposables = new lifecycle_1.$jc();
        const instantiationService = $Q0b(disposables);
        const model = $P0b(instantiationService, text, languageId, options, uri);
        model.registerDisposable(disposables);
        return model;
    }
    exports.$O0b = $O0b;
    function $P0b(instantiationService, text, languageId = null, _options = textModel_1.$MC.DEFAULT_CREATION_OPTIONS, uri = null) {
        const options = resolveOptions(_options);
        return instantiationService.createInstance(TestTextModel, text, languageId || modesRegistry_1.$Yt, options, uri);
    }
    exports.$P0b = $P0b;
    function $Q0b(disposables, services = []) {
        return (0, instantiationServiceMock_1.$M0b)(disposables, services.concat([
            [notification_1.$Yu, testNotificationService_1.$I0b],
            [dialogs_1.$oA, testDialogService_1.$H0b],
            [undoRedo_1.$wu, undoRedoService_1.$myb],
            [language_1.$ct, languageService_1.$jmb],
            [languageConfigurationRegistry_1.$2t, testLanguageConfigurationService_1.$D0b],
            [configuration_1.$8h, testConfigurationService_1.$G0b],
            [textResourceConfiguration_1.$GA, testTextResourcePropertiesService_1.$F0b],
            [themeService_1.$gv, testThemeService_1.$K0b],
            [log_1.$5i, log_1.$fj],
            [environment_1.$Ih, new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.isBuilt = true;
                        this.isExtensionDevelopment = false;
                    }
                }],
            [languageFeatureDebounce_1.$52, languageFeatureDebounce_1.$62],
            [languageFeatures_1.$hF, languageFeaturesService_1.$oBb],
            [model_1.$yA, modelService_1.$4yb],
        ]));
    }
    exports.$Q0b = $Q0b;
});
//# sourceMappingURL=testTextModel.js.map