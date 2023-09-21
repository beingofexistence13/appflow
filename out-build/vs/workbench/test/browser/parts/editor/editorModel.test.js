/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/common/editor/textEditorModel", "vs/editor/common/languages/language", "vs/editor/common/services/languageService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelService", "vs/editor/common/model/textModel", "vs/editor/common/services/textResourceConfiguration", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/test/common/testNotificationService", "vs/platform/notification/common/notification", "vs/workbench/test/common/workbenchTestServices", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/common/editor/editorModel", "vs/base/common/mime", "vs/workbench/services/languageDetection/browser/languageDetectionWorkerServiceImpl", "vs/workbench/services/environment/common/environmentService", "vs/workbench/test/browser/workbenchTestServices", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/editor/common/languages/languageConfigurationRegistry", "vs/platform/accessibility/test/common/testAccessibilityService", "vs/workbench/services/editor/common/editorService", "vs/platform/storage/common/storage", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, instantiationServiceMock_1, textEditorModel_1, language_1, languageService_1, configuration_1, testConfigurationService_1, modelService_1, textModel_1, textResourceConfiguration_1, undoRedo_1, undoRedoService_1, testDialogService_1, dialogs_1, testNotificationService_1, notification_1, workbenchTestServices_1, themeService_1, testThemeService_1, editorModel_1, mime_1, languageDetectionWorkerServiceImpl_1, environmentService_1, workbenchTestServices_2, testLanguageConfigurationService_1, languageConfigurationRegistry_1, testAccessibilityService_1, editorService_1, storage_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorModel', () => {
        class MyEditorModel extends editorModel_1.$xA {
        }
        class MyTextEditorModel extends textEditorModel_1.$DA {
            testCreateTextEditorModel(value, resource, preferredLanguageId) {
                return super.H(value, resource, preferredLanguageId);
            }
            isReadonly() {
                return false;
            }
        }
        function stubModelService(instantiationService) {
            const dialogService = new testDialogService_1.$H0b();
            const notificationService = new testNotificationService_1.$I0b();
            const undoRedoService = new undoRedoService_1.$myb(dialogService, notificationService);
            instantiationService.stub(environmentService_1.$hJ, workbenchTestServices_2.$qec);
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
            instantiationService.stub(textResourceConfiguration_1.$GA, new workbenchTestServices_1.$5dc(instantiationService.get(configuration_1.$8h)));
            instantiationService.stub(dialogs_1.$oA, dialogService);
            instantiationService.stub(notification_1.$Yu, notificationService);
            instantiationService.stub(undoRedo_1.$wu, undoRedoService);
            instantiationService.stub(editorService_1.$9C, new workbenchTestServices_2.$Eec());
            instantiationService.stub(themeService_1.$gv, new testThemeService_1.$K0b());
            instantiationService.stub(languageConfigurationRegistry_1.$2t, disposables.add(new testLanguageConfigurationService_1.$D0b()));
            instantiationService.stub(storage_1.$Vo, disposables.add(new workbenchTestServices_1.$7dc()));
            return disposables.add(instantiationService.createInstance(modelService_1.$4yb));
        }
        let instantiationService;
        let languageService;
        const disposables = new lifecycle_1.$jc();
        setup(() => {
            instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
            languageService = instantiationService.stub(language_1.$ct, languageService_1.$jmb);
        });
        teardown(() => {
            disposables.clear();
        });
        test('basics', async () => {
            let counter = 0;
            const model = disposables.add(new MyEditorModel());
            disposables.add(model.onWillDispose(() => {
                assert(true);
                counter++;
            }));
            await model.resolve();
            assert.strictEqual(model.isDisposed(), false);
            assert.strictEqual(model.isResolved(), true);
            model.dispose();
            assert.strictEqual(counter, 1);
            assert.strictEqual(model.isDisposed(), true);
        });
        test('BaseTextEditorModel', async () => {
            const modelService = stubModelService(instantiationService);
            const model = disposables.add(new MyTextEditorModel(modelService, languageService, disposables.add(instantiationService.createInstance(languageDetectionWorkerServiceImpl_1.$lBb)), instantiationService.createInstance(testAccessibilityService_1.$y0b)));
            await model.resolve();
            disposables.add(model.testCreateTextEditorModel((0, textModel_1.$IC)('foo'), null, mime_1.$Hr.text));
            assert.strictEqual(model.isResolved(), true);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=editorModel.test.js.map