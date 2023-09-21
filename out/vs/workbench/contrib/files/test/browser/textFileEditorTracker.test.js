/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/workbench/contrib/files/browser/editors/textFileEditorTracker", "vs/base/test/common/utils", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/async", "vs/base/common/lifecycle", "vs/workbench/services/editor/browser/editorService", "vs/base/common/resources", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/contrib/files/common/files", "vs/workbench/common/editor", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/test/common/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentityService"], function (require, exports, assert, event_1, textFileEditorTracker_1, utils_1, editorService_1, workbenchTestServices_1, textfiles_1, files_1, editorGroupsService_1, async_1, lifecycle_1, editorService_2, resources_1, testConfigurationService_1, configuration_1, filesConfigurationService_1, mockKeybindingService_1, files_2, editor_1, testWorkspace_1, workbenchTestServices_2, uriIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - TextFileEditorTracker', () => {
        const disposables = new lifecycle_1.DisposableStore();
        class TestTextFileEditorTracker extends textFileEditorTracker_1.TextFileEditorTracker {
            getDirtyTextFileTrackerDelay() {
                return 5; // encapsulated in a method for tests to override
            }
        }
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
        });
        teardown(() => {
            disposables.clear();
        });
        async function createTracker(autoSaveEnabled = false) {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            if (autoSaveEnabled) {
                const configurationService = new testConfigurationService_1.TestConfigurationService();
                configurationService.setUserConfiguration('files', { autoSave: 'afterDelay', autoSaveDelay: 1 });
                instantiationService.stub(configuration_1.IConfigurationService, configurationService);
                const fileService = disposables.add(new workbenchTestServices_1.TestFileService());
                instantiationService.stub(filesConfigurationService_1.IFilesConfigurationService, disposables.add(new workbenchTestServices_1.TestFilesConfigurationService(instantiationService.createInstance(mockKeybindingService_1.MockContextKeyService), configurationService, new workbenchTestServices_2.TestContextService(testWorkspace_1.TestWorkspace), workbenchTestServices_1.TestEnvironmentService, disposables.add(new uriIdentityService_1.UriIdentityService(fileService)), fileService)));
            }
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.EditorService));
            disposables.add(editorService);
            instantiationService.stub(editorService_1.IEditorService, editorService);
            const accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            disposables.add(accessor.textFileService.files);
            disposables.add(instantiationService.createInstance(TestTextFileEditorTracker));
            const cleanup = async () => {
                await (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
                part.dispose();
            };
            return { accessor, cleanup };
        }
        test('file change event updates model', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            const model = await accessor.textFileService.files.resolve(resource);
            disposables.add(model);
            model.textEditorModel.setValue('Super Good');
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), 'Super Good');
            await model.save();
            // change event (watcher)
            accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 0 /* FileChangeType.UPDATED */ }], false));
            await (0, async_1.timeout)(0); // due to event updating model async
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), 'Hello Html');
            await cleanup();
        });
        test('dirty text file model opens as editor', async function () {
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, false, false);
        });
        test('dirty text file model does not open as editor if autosave is ON', async function () {
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, true, false);
        });
        test('dirty text file model opens as editor when save fails', async function () {
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, false, true);
        });
        test('dirty text file model opens as editor when save fails if autosave is ON', async function () {
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, true, true);
        });
        async function testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, autoSave, error) {
            const { accessor, cleanup } = await createTracker(autoSave);
            assert.ok(!accessor.editorService.isOpened({ resource, typeId: files_2.FILE_EDITOR_INPUT_ID, editorId: editor_1.DEFAULT_EDITOR_ASSOCIATION.id }));
            if (error) {
                accessor.textFileService.setWriteErrorOnce(new files_1.FileOperationError('fail to write', 10 /* FileOperationResult.FILE_OTHER_ERROR */));
            }
            const model = await accessor.textFileService.files.resolve(resource);
            disposables.add(model);
            model.textEditorModel.setValue('Super Good');
            if (autoSave) {
                await model.save();
                await (0, async_1.timeout)(10);
                if (error) {
                    assert.ok(accessor.editorService.isOpened({ resource, typeId: files_2.FILE_EDITOR_INPUT_ID, editorId: editor_1.DEFAULT_EDITOR_ASSOCIATION.id }));
                }
                else {
                    assert.ok(!accessor.editorService.isOpened({ resource, typeId: files_2.FILE_EDITOR_INPUT_ID, editorId: editor_1.DEFAULT_EDITOR_ASSOCIATION.id }));
                }
            }
            else {
                await awaitEditorOpening(accessor.editorService);
                assert.ok(accessor.editorService.isOpened({ resource, typeId: files_2.FILE_EDITOR_INPUT_ID, editorId: editor_1.DEFAULT_EDITOR_ASSOCIATION.id }));
            }
            await cleanup();
        }
        test('dirty untitled text file model opens as editor', function () {
            return testUntitledEditor(false);
        });
        test('dirty untitled text file model opens as editor - autosave ON', function () {
            return testUntitledEditor(true);
        });
        async function testUntitledEditor(autoSaveEnabled) {
            const { accessor, cleanup } = await createTracker(autoSaveEnabled);
            const untitledTextEditor = await accessor.textEditorService.resolveTextEditor({ resource: undefined, forceUntitled: true });
            const model = disposables.add(await untitledTextEditor.resolve());
            assert.ok(!accessor.editorService.isOpened(untitledTextEditor));
            model.textEditorModel?.setValue('Super Good');
            await awaitEditorOpening(accessor.editorService);
            assert.ok(accessor.editorService.isOpened(untitledTextEditor));
            await cleanup();
        }
        function awaitEditorOpening(editorService) {
            return event_1.Event.toPromise(event_1.Event.once(editorService.onDidActiveEditorChange));
        }
        test('non-dirty files reload on window focus', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await accessor.editorService.openEditor(await accessor.textEditorService.resolveTextEditor({ resource, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id } }));
            accessor.hostService.setFocus(false);
            accessor.hostService.setFocus(true);
            await awaitModelResolveEvent(accessor.textFileService, resource);
            await cleanup();
        });
        function awaitModelResolveEvent(textFileService, resource) {
            return new Promise(resolve => {
                const listener = textFileService.files.onDidResolve(e => {
                    if ((0, resources_1.isEqual)(e.model.resource, resource)) {
                        listener.dispose();
                        resolve();
                    }
                });
            });
        }
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEZpbGVFZGl0b3JUcmFja2VyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy90ZXN0L2Jyb3dzZXIvdGV4dEZpbGVFZGl0b3JUcmFja2VyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUE2QmhHLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7UUFFM0MsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFFMUMsTUFBTSx5QkFBMEIsU0FBUSw2Q0FBcUI7WUFFekMsNEJBQTRCO2dCQUM5QyxPQUFPLENBQUMsQ0FBQyxDQUFDLGlEQUFpRDtZQUM1RCxDQUFDO1NBQ0Q7UUFFRCxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFBLDhDQUFzQixHQUFFLENBQUMsQ0FBQztZQUMxQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsa0RBQTBCLEdBQUUsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssVUFBVSxhQUFhLENBQUMsZUFBZSxHQUFHLEtBQUs7WUFDbkQsTUFBTSxvQkFBb0IsR0FBRyxJQUFBLHFEQUE2QixFQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUVuRixJQUFJLGVBQWUsRUFBRTtnQkFDcEIsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7Z0JBQzVELG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRWpHLG9C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