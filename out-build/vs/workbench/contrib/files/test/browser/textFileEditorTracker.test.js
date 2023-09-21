/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/workbench/contrib/files/browser/editors/textFileEditorTracker", "vs/base/test/common/utils", "vs/workbench/services/editor/common/editorService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/async", "vs/base/common/lifecycle", "vs/workbench/services/editor/browser/editorService", "vs/base/common/resources", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/contrib/files/common/files", "vs/workbench/common/editor", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/test/common/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentityService"], function (require, exports, assert, event_1, textFileEditorTracker_1, utils_1, editorService_1, workbenchTestServices_1, textfiles_1, files_1, editorGroupsService_1, async_1, lifecycle_1, editorService_2, resources_1, testConfigurationService_1, configuration_1, filesConfigurationService_1, mockKeybindingService_1, files_2, editor_1, testWorkspace_1, workbenchTestServices_2, uriIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - TextFileEditorTracker', () => {
        const disposables = new lifecycle_1.$jc();
        class TestTextFileEditorTracker extends textFileEditorTracker_1.$5Lb {
            r() {
                return 5; // encapsulated in a method for tests to override
            }
        }
        setup(() => {
            disposables.add((0, workbenchTestServices_1.$Wec)());
            disposables.add((0, workbenchTestServices_1.$Xec)());
        });
        teardown(() => {
            disposables.clear();
        });
        async function createTracker(autoSaveEnabled = false) {
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            if (autoSaveEnabled) {
                const configurationService = new testConfigurationService_1.$G0b();
                configurationService.setUserConfiguration('files', { autoSave: 'afterDelay', autoSaveDelay: 1 });
                instantiationService.stub(configuration_1.$8h, configurationService);
                const fileService = disposables.add(new workbenchTestServices_1.$Fec());
                instantiationService.stub(filesConfigurationService_1.$yD, disposables.add(new workbenchTestServices_1.$Sec(instantiationService.createInstance(mockKeybindingService_1.$S0b), configurationService, new workbenchTestServices_2.$6dc(testWorkspace_1.$$0b), workbenchTestServices_1.$qec, disposables.add(new uriIdentityService_1.$pr(fileService)), fileService)));
            }
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.$Lyb));
            disposables.add(editorService);
            instantiationService.stub(editorService_1.$9C, editorService);
            const accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            disposables.add(accessor.textFileService.files);
            disposables.add(instantiationService.createInstance(TestTextFileEditorTracker));
            const cleanup = async () => {
                await (0, workbenchTestServices_1.$hfc)(instantiationService);
                part.dispose();
            };
            return { accessor, cleanup };
        }
        test('file change event updates model', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            const model = await accessor.textFileService.files.resolve(resource);
            disposables.add(model);
            model.textEditorModel.setValue('Super Good');
            assert.strictEqual((0, textfiles_1.$MD)(model.createSnapshot()), 'Super Good');
            await model.save();
            // change event (watcher)
            accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 0 /* FileChangeType.UPDATED */ }], false));
            await (0, async_1.$Hg)(0); // due to event updating model async
            assert.strictEqual((0, textfiles_1.$MD)(model.createSnapshot()), 'Hello Html');
            await cleanup();
        });
        test('dirty text file model opens as editor', async function () {
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, false, false);
        });
        test('dirty text file model does not open as editor if autosave is ON', async function () {
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, true, false);
        });
        test('dirty text file model opens as editor when save fails', async function () {
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, false, true);
        });
        test('dirty text file model opens as editor when save fails if autosave is ON', async function () {
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, true, true);
        });
        async function testDirtyTextFileModelOpensEditorDependingOnAutoSaveSetting(resource, autoSave, error) {
            const { accessor, cleanup } = await createTracker(autoSave);
            assert.ok(!accessor.editorService.isOpened({ resource, typeId: files_2.$8db, editorId: editor_1.$HE.id }));
            if (error) {
                accessor.textFileService.setWriteErrorOnce(new files_1.$nk('fail to write', 10 /* FileOperationResult.FILE_OTHER_ERROR */));
            }
            const model = await accessor.textFileService.files.resolve(resource);
            disposables.add(model);
            model.textEditorModel.setValue('Super Good');
            if (autoSave) {
                await model.save();
                await (0, async_1.$Hg)(10);
                if (error) {
                    assert.ok(accessor.editorService.isOpened({ resource, typeId: files_2.$8db, editorId: editor_1.$HE.id }));
                }
                else {
                    assert.ok(!accessor.editorService.isOpened({ resource, typeId: files_2.$8db, editorId: editor_1.$HE.id }));
                }
            }
            else {
                await awaitEditorOpening(accessor.editorService);
                assert.ok(accessor.editorService.isOpened({ resource, typeId: files_2.$8db, editorId: editor_1.$HE.id }));
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
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await accessor.editorService.openEditor(await accessor.textEditorService.resolveTextEditor({ resource, options: { override: editor_1.$HE.id } }));
            accessor.hostService.setFocus(false);
            accessor.hostService.setFocus(true);
            await awaitModelResolveEvent(accessor.textFileService, resource);
            await cleanup();
        });
        function awaitModelResolveEvent(textFileService, resource) {
            return new Promise(resolve => {
                const listener = textFileService.files.onDidResolve(e => {
                    if ((0, resources_1.$bg)(e.model.resource, resource)) {
                        listener.dispose();
                        resolve();
                    }
                });
            });
        }
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=textFileEditorTracker.test.js.map