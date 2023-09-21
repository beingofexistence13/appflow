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
            return (0, testCodeEditor_1.createTestCodeEditor)(model, {
                hasTextFocus: false,
                serviceCollection: new serviceCollection_1.ServiceCollection([codeEditorService_1.ICodeEditorService, codeEditorService])
            });
        }
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            deltas.length = 0;
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('editor', { 'detectIndentation': false });
            const dialogService = new testDialogService_1.TestDialogService();
            const notificationService = new testNotificationService_1.TestNotificationService();
            const undoRedoService = new undoRedoService_1.UndoRedoService(dialogService, notificationService);
            const themeService = new testThemeService_1.TestThemeService();
            modelService = new modelService_1.ModelService(configService, new workbenchTestServices_2.TestTextResourcePropertiesService(configService), undoRedoService, disposables.add(new languageService_1.LanguageService()), new testLanguageConfigurationService_1.TestLanguageConfigurationService());
            codeEditorService = new editorTestServices_1.TestCodeEditorService(themeService);
            textFileService = new class extends (0, mock_1.mock)() {
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
            const workbenchEditorService = new workbenchTestServices_1.TestEditorService();
            const editorGroupService = new workbenchTestServices_1.TestEditorGroupsService();
            const fileService = new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidRunOperation = event_1.Event.None;
                    this.onDidChangeFileSystemProviderCapabilities = event_1.Event.None;
                    this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
                }
            };
            new mainThreadDocumentsAndEditors_1.MainThreadDocumentsAndEditors((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
                $acceptDocumentsAndEditorsDelta(delta) { deltas.push(delta); }
            }), modelService, textFileService, workbenchEditorService, codeEditorService, fileService, null, editorGroupService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidPaneCompositeOpen = event_1.Event.None;
                    this.onDidPaneCompositeClose = event_1.Event.None;
                }
                getActivePaneComposite() {
                    return undefined;
                }
            }, workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_2.TestWorkingCopyFileService(), new uriIdentityService_1.UriIdentityService(fileService), new class extends (0, mock_1.mock)() {
                readText() {
                    return Promise.resolve('clipboard_contents');
                }
            }, new workbenchTestServices_1.TestPathService(), new testConfigurationService_1.TestConfigurationService());
        });
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
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
            const oldLimit = textModel_1.TextModel._MODEL_SYNC_LIMIT;
            try {
                const largeModelString = 'abc'.repeat(1024);
                textModel_1.TextModel._MODEL_SYNC_LIMIT = largeModelString.length / 2;
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
                textModel_1.TextModel._MODEL_SYNC_LIMIT = oldLimit;
            }
        });
        test('ignore huge model from editor', function () {
            const oldLimit = textModel_1.TextModel._MODEL_SYNC_LIMIT;
            try {
                const largeModelString = 'abc'.repeat(1024);
                textModel_1.TextModel._MODEL_SYNC_LIMIT = largeModelString.length / 2;
                const model = modelService.createModel(largeModelString, null);
                const editor = myCreateTestCodeEditor(model);
                assert.strictEqual(deltas.length, 1);
                deltas.length = 0;
                assert.strictEqual(deltas.length, 0);
                editor.dispose();
                model.dispose();
            }
            finally {
                textModel_1.TextModel._MODEL_SYNC_LIMIT = oldLimit;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERvY3VtZW50c0FuZEVkaXRvcnMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvdGVzdC9icm93c2VyL21haW5UaHJlYWREb2N1bWVudHNBbmRFZGl0b3JzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFnQ2hHLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7UUFFM0MsSUFBSSxXQUE0QixDQUFDO1FBRWpDLElBQUksWUFBMEIsQ0FBQztRQUMvQixJQUFJLGlCQUF3QyxDQUFDO1FBQzdDLElBQUksZUFBaUMsQ0FBQztRQUN0QyxNQUFNLE1BQU0sR0FBZ0MsRUFBRSxDQUFDO1FBRS9DLFNBQVMsc0JBQXNCLENBQUMsS0FBNkI7WUFDNUQsT0FBTyxJQUFBLHFDQUFvQixFQUFDLEtBQUssRUFBRTtnQkFDbEMsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLGlCQUFpQixFQUFFLElBQUkscUNBQWlCLENBQ3ZDLENBQUMsc0NBQWtCLEVBQUUsaUJBQWlCLENBQUMsQ0FDdkM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUVwQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNsQixNQUFNLGFBQWEsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7WUFDckQsYUFBYSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxFQUFFLG1CQUFtQixFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDN0UsTUFBTSxhQUFhLEdBQUcsSUFBSSxxQ0FBaUIsRUFBRSxDQUFDO1lBQzlDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxpREFBdUIsRUFBRSxDQUFDO1lBQzFELE1BQU0sZUFBZSxHQUFHLElB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