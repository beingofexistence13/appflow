/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadDocumentsAndEditors", "vs/workbench/api/test/common/testRPCProtocol", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelService", "vs/editor/test/browser/editorTestServices", "vs/editor/test/browser/testCodeEditor", "vs/base/test/common/mock", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/event", "vs/platform/instantiation/common/serviceCollection", "vs/editor/browser/services/codeEditorService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/test/common/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentityService", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/editor/common/model/textModel", "vs/editor/common/services/languageService", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, mainThreadDocumentsAndEditors_1, testRPCProtocol_1, testConfigurationService_1, modelService_1, editorTestServices_1, testCodeEditor_1, mock_1, workbenchTestServices_1, event_1, serviceCollection_1, codeEditorService_1, testThemeService_1, undoRedoService_1, testDialogService_1, testNotificationService_1, workbenchTestServices_2, uriIdentityService_1, testLanguageConfigurationService_1, textModel_1, languageService_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadDocumentsAndEditors', () => {
        let disposables;
        let modelService;
        let codeEditorService;
        let textFileService;
        const deltas = [];
        function myCreateTestCodeEditor(model) {
            return (0, testCodeEditor_1.$10b)(model, {
                hasTextFocus: false,
                serviceCollection: new serviceCollection_1.$zh([codeEditorService_1.$nV, codeEditorService])
            });
        }
        setup(() => {
            disposables = new lifecycle_1.$jc();
            deltas.length = 0;
            const configService = new testConfigurationService_1.$G0b();
            configService.setUserConfiguration('editor', { 'detectIndentation': false });
            const dialogService = new testDialogService_1.$H0b();
            const notificationService = new testNotificationService_1.$I0b();
            const undoRedoService = new undoRedoService_1.$myb(dialogService, notificationService);
            const themeService = new testThemeService_1.$K0b();
            modelService = new modelService_1.$4yb(configService, new workbenchTestServices_2.$5dc(configService), undoRedoService, disposables.add(new languageService_1.$jmb()), new testLanguageConfigurationService_1.$D0b());
            codeEditorService = new editorTestServices_1.$A0b(themeService);
            textFileService = new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.files = {
                        onDidSave: event_1.Event.None,
                        onDidRevert: event_1.Event.None,
                        onDidChangeDirty: event_1.Event.None
                    };
                }
                isDirty() { return false; }
            };
            const workbenchEditorService = new workbenchTestServices_1.$Eec();
            const editorGroupService = new workbenchTestServices_1.$Bec();
            const fileService = new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidRunOperation = event_1.Event.None;
                    this.onDidChangeFileSystemProviderCapabilities = event_1.Event.None;
                    this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
                }
            };
            new mainThreadDocumentsAndEditors_1.$Zeb((0, testRPCProtocol_1.$2dc)(new class extends (0, mock_1.$rT)() {
                $acceptDocumentsAndEditorsDelta(delta) { deltas.push(delta); }
            }), modelService, textFileService, workbenchEditorService, codeEditorService, fileService, null, editorGroupService, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidPaneCompositeOpen = event_1.Event.None;
                    this.onDidPaneCompositeClose = event_1.Event.None;
                }
                getActivePaneComposite() {
                    return undefined;
                }
            }, workbenchTestServices_1.$qec, new workbenchTestServices_2.$$dc(), new uriIdentityService_1.$pr(fileService), new class extends (0, mock_1.$rT)() {
                readText() {
                    return Promise.resolve('clipboard_contents');
                }
            }, new workbenchTestServices_1.$5ec(), new testConfigurationService_1.$G0b());
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        test('Model#add', () => {
            deltas.length = 0;
            disposables.add(modelService.createModel('farboo', null));
            assert.strictEqual(deltas.length, 1);
            const [delta] = deltas;
            assert.strictEqual(delta.addedDocuments.length, 1);
            assert.strictEqual(delta.removedDocuments, undefined);
            assert.strictEqual(delta.addedEditors, undefined);
            assert.strictEqual(delta.removedEditors, undefined);
            assert.strictEqual(delta.newActiveEditor, undefined);
        });
        test('ignore huge model', function () {
            const oldLimit = textModel_1.$MC._MODEL_SYNC_LIMIT;
            try {
                const largeModelString = 'abc'.repeat(1024);
                textModel_1.$MC._MODEL_SYNC_LIMIT = largeModelString.length / 2;
                const model = modelService.createModel(largeModelString, null);
                disposables.add(model);
                assert.ok(model.isTooLargeForSyncing());
                assert.strictEqual(deltas.length, 1);
                const [delta] = deltas;
                assert.strictEqual(delta.newActiveEditor, null);
                assert.strictEqual(delta.addedDocuments, undefined);
                assert.strictEqual(delta.removedDocuments, undefined);
                assert.strictEqual(delta.addedEditors, undefined);
                assert.strictEqual(delta.removedEditors, undefined);
            }
            finally {
                textModel_1.$MC._MODEL_SYNC_LIMIT = oldLimit;
            }
        });
        test('ignore huge model from editor', function () {
            const oldLimit = textModel_1.$MC._MODEL_SYNC_LIMIT;
            try {
                const largeModelString = 'abc'.repeat(1024);
                textModel_1.$MC._MODEL_SYNC_LIMIT = largeModelString.length / 2;
                const model = modelService.createModel(largeModelString, null);
                const editor = myCreateTestCodeEditor(model);
                assert.strictEqual(deltas.length, 1);
                deltas.length = 0;
                assert.strictEqual(deltas.length, 0);
                editor.dispose();
                model.dispose();
            }
            finally {
                textModel_1.$MC._MODEL_SYNC_LIMIT = oldLimit;
            }
        });
        test('ignore simple widget model', function () {
            this.timeout(1000 * 60); // increase timeout for this one test
            const model = modelService.createModel('test', null, undefined, true);
            disposables.add(model);
            assert.ok(model.isForSimpleWidget);
            assert.strictEqual(deltas.length, 1);
            const [delta] = deltas;
            assert.strictEqual(delta.newActiveEditor, null);
            assert.strictEqual(delta.addedDocuments, undefined);
            assert.strictEqual(delta.removedDocuments, undefined);
            assert.strictEqual(delta.addedEditors, undefined);
            assert.strictEqual(delta.removedEditors, undefined);
        });
        test('ignore editor w/o model', () => {
            const editor = myCreateTestCodeEditor(undefined);
            assert.strictEqual(deltas.length, 1);
            const [delta] = deltas;
            assert.strictEqual(delta.newActiveEditor, null);
            assert.strictEqual(delta.addedDocuments, undefined);
            assert.strictEqual(delta.removedDocuments, undefined);
            assert.strictEqual(delta.addedEditors, undefined);
            assert.strictEqual(delta.removedEditors, undefined);
            editor.dispose();
        });
        test('editor with model', () => {
            deltas.length = 0;
            const model = modelService.createModel('farboo', null);
            const editor = myCreateTestCodeEditor(model);
            assert.strictEqual(deltas.length, 2);
            const [first, second] = deltas;
            assert.strictEqual(first.addedDocuments.length, 1);
            assert.strictEqual(first.newActiveEditor, undefined);
            assert.strictEqual(first.removedDocuments, undefined);
            assert.strictEqual(first.addedEditors, undefined);
            assert.strictEqual(first.removedEditors, undefined);
            assert.strictEqual(second.addedEditors.length, 1);
            assert.strictEqual(second.addedDocuments, undefined);
            assert.strictEqual(second.removedDocuments, undefined);
            assert.strictEqual(second.removedEditors, undefined);
            assert.strictEqual(second.newActiveEditor, undefined);
            editor.dispose();
            model.dispose();
        });
        test('editor with dispos-ed/-ing model', () => {
            const model = modelService.createModel('farboo', null);
            const editor = myCreateTestCodeEditor(model);
            // ignore things until now
            deltas.length = 0;
            modelService.destroyModel(model.uri);
            assert.strictEqual(deltas.length, 1);
            const [first] = deltas;
            assert.strictEqual(first.newActiveEditor, undefined);
            assert.strictEqual(first.removedEditors.length, 1);
            assert.strictEqual(first.removedDocuments.length, 1);
            assert.strictEqual(first.addedDocuments, undefined);
            assert.strictEqual(first.addedEditors, undefined);
            editor.dispose();
            model.dispose();
        });
    });
});
//# sourceMappingURL=mainThreadDocumentsAndEditors.test.js.map