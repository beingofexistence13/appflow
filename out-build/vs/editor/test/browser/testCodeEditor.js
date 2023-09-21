/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/editorWorker", "vs/editor/common/services/languageFeatureDebounce", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/languageService", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/common/services/textResourceConfiguration", "vs/editor/test/browser/config/testConfiguration", "vs/editor/test/browser/editorTestServices", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/editor/test/common/services/testEditorWorkerService", "vs/editor/test/common/services/testTextResourcePropertiesService", "vs/editor/test/common/testTextModel", "vs/platform/accessibility/common/accessibility", "vs/platform/accessibility/test/common/testAccessibilityService", "vs/platform/clipboard/common/clipboardService", "vs/platform/clipboard/test/common/testClipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/opener/common/opener", "vs/platform/opener/test/common/nullOpenerService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService"], function (require, exports, lifecycle_1, mock_1, codeEditorService_1, codeEditorWidget_1, language_1, languageConfigurationRegistry_1, editorWorker_1, languageFeatureDebounce_1, languageFeatures_1, languageFeaturesService_1, languageService_1, model_1, modelService_1, textResourceConfiguration_1, testConfiguration_1, editorTestServices_1, testLanguageConfigurationService_1, testEditorWorkerService_1, testTextResourcePropertiesService_1, testTextModel_1, accessibility_1, testAccessibilityService_1, clipboardService_1, testClipboardService_1, commands_1, configuration_1, testConfigurationService_1, contextkey_1, dialogs_1, testDialogService_1, environment_1, descriptors_1, serviceCollection_1, instantiationServiceMock_1, keybinding_1, mockKeybindingService_1, log_1, notification_1, testNotificationService_1, opener_1, nullOpenerService_1, telemetry_1, telemetryUtils_1, themeService_1, testThemeService_1, undoRedo_1, undoRedoService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$20b = exports.$10b = exports.$Z0b = exports.$Y0b = exports.$X0b = exports.$W0b = void 0;
    class $W0b extends codeEditorWidget_1.$uY {
        constructor() {
            super(...arguments);
            this.dc = false;
        }
        //#region testing overrides
        Cb(isSimpleWidget, options) {
            return new testConfiguration_1.$z0b(options);
        }
        Vb(viewModel) {
            // Never create a view
            return [null, false];
        }
        setHasTextFocus(hasTextFocus) {
            this.dc = hasTextFocus;
        }
        hasTextFocus() {
            return this.dc;
        }
        //#endregion
        //#region Testing utils
        getViewModel() {
            return this.mb ? this.mb.viewModel : undefined;
        }
        registerAndInstantiateContribution(id, ctor) {
            const r = this.nb.createInstance(ctor, this);
            this.f.set(id, r);
            return r;
        }
        registerDisposable(disposable) {
            this.B(disposable);
        }
    }
    exports.$W0b = $W0b;
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
    function $X0b(text, options, callback) {
        return _withTestCodeEditor(text, options, callback);
    }
    exports.$X0b = $X0b;
    async function $Y0b(text, options, callback) {
        return _withTestCodeEditor(text, options, callback);
    }
    exports.$Y0b = $Y0b;
    function isTextModel(arg) {
        return Boolean(arg && arg.uri);
    }
    function _withTestCodeEditor(arg, options, callback) {
        const disposables = new lifecycle_1.$jc();
        const instantiationService = $Z0b(disposables, options.serviceCollection);
        delete options.serviceCollection;
        // create a model if necessary
        let model;
        if (isTextModel(arg)) {
            model = arg;
        }
        else {
            model = disposables.add((0, testTextModel_1.$P0b)(instantiationService, Array.isArray(arg) ? arg.join('\n') : arg));
        }
        const editor = disposables.add($20b(instantiationService, model, options));
        const viewModel = editor.getViewModel();
        viewModel.setHasFocus(true);
        const result = callback(editor, editor.getViewModel(), instantiationService);
        if (result) {
            return result.then(() => disposables.dispose());
        }
        disposables.dispose();
    }
    function $Z0b(disposables, services = new serviceCollection_1.$zh()) {
        const serviceIdentifiers = [];
        const define = (id, ctor) => {
            if (!services.has(id)) {
                services.set(id, new descriptors_1.$yh(ctor));
            }
            serviceIdentifiers.push(id);
        };
        const defineInstance = (id, instance) => {
            if (!services.has(id)) {
                services.set(id, instance);
            }
            serviceIdentifiers.push(id);
        };
        define(accessibility_1.$1r, testAccessibilityService_1.$y0b);
        define(keybinding_1.$2D, mockKeybindingService_1.$U0b);
        define(clipboardService_1.$UZ, testClipboardService_1.$R0b);
        define(editorWorker_1.$4Y, testEditorWorkerService_1.$E0b);
        defineInstance(opener_1.$NT, nullOpenerService_1.$V0b);
        define(notification_1.$Yu, testNotificationService_1.$I0b);
        define(dialogs_1.$oA, testDialogService_1.$H0b);
        define(undoRedo_1.$wu, undoRedoService_1.$myb);
        define(language_1.$ct, languageService_1.$jmb);
        define(languageConfigurationRegistry_1.$2t, testLanguageConfigurationService_1.$D0b);
        define(configuration_1.$8h, testConfigurationService_1.$G0b);
        define(textResourceConfiguration_1.$GA, testTextResourcePropertiesService_1.$F0b);
        define(themeService_1.$gv, testThemeService_1.$K0b);
        define(log_1.$5i, log_1.$fj);
        define(model_1.$yA, modelService_1.$4yb);
        define(codeEditorService_1.$nV, editorTestServices_1.$A0b);
        define(contextkey_1.$3i, mockKeybindingService_1.$S0b);
        define(commands_1.$Fr, editorTestServices_1.$C0b);
        define(telemetry_1.$9k, telemetryUtils_1.$ao);
        define(environment_1.$Ih, class extends (0, mock_1.$rT)() {
            constructor() {
                super(...arguments);
                this.isBuilt = true;
                this.isExtensionDevelopment = false;
            }
        });
        define(languageFeatureDebounce_1.$52, languageFeatureDebounce_1.$62);
        define(languageFeatures_1.$hF, languageFeaturesService_1.$oBb);
        const instantiationService = disposables.add(new instantiationServiceMock_1.$L0b(services, true));
        disposables.add((0, lifecycle_1.$ic)(() => {
            for (const id of serviceIdentifiers) {
                const instanceOrDescriptor = services.get(id);
                if (typeof instanceOrDescriptor.dispose === 'function') {
                    instanceOrDescriptor.dispose();
                }
            }
        }));
        return instantiationService;
    }
    exports.$Z0b = $Z0b;
    function $10b(model, options = {}) {
        const disposables = new lifecycle_1.$jc();
        const instantiationService = $Z0b(disposables, options.serviceCollection);
        delete options.serviceCollection;
        const editor = $20b(instantiationService, model || null, options);
        editor.registerDisposable(disposables);
        return editor;
    }
    exports.$10b = $10b;
    function $20b(instantiationService, model, options = {}) {
        const codeEditorWidgetOptions = {
            contributions: []
        };
        const editor = instantiationService.createInstance($W0b, new TestEditorDomElement(), options, codeEditorWidgetOptions);
        if (typeof options.hasTextFocus === 'undefined') {
            options.hasTextFocus = true;
        }
        editor.setHasTextFocus(options.hasTextFocus);
        editor.setModel(model);
        const viewModel = editor.getViewModel();
        viewModel?.setHasFocus(options.hasTextFocus);
        return editor;
    }
    exports.$20b = $20b;
});
//# sourceMappingURL=testCodeEditor.js.map