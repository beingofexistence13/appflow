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
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/test/common/utils", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/log/common/log", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/async", "vs/workbench/services/workingCopy/browser/workingCopyBackupTracker", "vs/base/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/base/common/buffer", "vs/base/common/platform", "vs/base/common/network"], function (require, exports, assert, uri_1, editorService_1, editorGroupsService_1, editorService_2, workingCopyBackup_1, utils_1, filesConfigurationService_1, workingCopyService_1, log_1, lifecycle_1, untitledTextEditorInput_1, workbenchTestServices_1, workbenchTestServices_2, async_1, workingCopyBackupTracker_1, lifecycle_2, workingCopyEditorService_1, buffer_1, platform_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WorkingCopyBackupTracker (browser)', function () {
        let accessor;
        const disposables = new lifecycle_2.DisposableStore();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
        });
        teardown(async () => {
            await (0, workbenchTestServices_1.workbenchTeardown)(accessor.instantiationService);
            disposables.clear();
        });
        let TestWorkingCopyBackupTracker = class TestWorkingCopyBackupTracker extends workingCopyBackupTracker_1.BrowserWorkingCopyBackupTracker {
            constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, logService, workingCopyEditorService, editorService, editorGroupService) {
                super(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, logService, workingCopyEditorService, editorService, editorGroupService);
            }
            getBackupScheduleDelay() {
                return 10; // Reduce timeout for tests
            }
            get pendingBackupOperationCount() { return this.pendingBackupOperations.size; }
            getUnrestoredBackups() {
                return this.unrestoredBackups;
            }
            async testRestoreBackups(handler) {
                return super.restoreBackups(handler);
            }
        };
        TestWorkingCopyBackupTracker = __decorate([
            __param(0, workingCopyBackup_1.IWorkingCopyBackupService),
            __param(1, filesConfigurationService_1.IFilesConfigurationService),
            __param(2, workingCopyService_1.IWorkingCopyService),
            __param(3, lifecycle_1.ILifecycleService),
            __param(4, log_1.ILogService),
            __param(5, workingCopyEditorService_1.IWorkingCopyEditorService),
            __param(6, editorService_1.IEditorService),
            __param(7, editorGroupsService_1.IEditorGroupsService)
        ], TestWorkingCopyBackupTracker);
        class TestUntitledTextEditorInput extends untitledTextEditorInput_1.UntitledTextEditorInput {
            constructor() {
                super(...arguments);
                this.resolved = false;
            }
            resolve() {
                this.resolved = true;
                return super.resolve();
            }
        }
        async function createTracker() {
            const workingCopyBackupService = disposables.add(new workbenchTestServices_1.InMemoryTestWorkingCopyBackupService());
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            instantiationService.stub(workingCopyBackup_1.IWorkingCopyBackupService, workingCopyBackupService);
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.EditorService));
            instantiationService.stub(editorService_1.IEditorService, editorService);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            const tracker = disposables.add(instantiationService.createInstance(TestWorkingCopyBackupTracker));
            return { accessor, part, tracker, workingCopyBackupService: workingCopyBackupService, instantiationService };
        }
        async function untitledBackupTest(untitled = { resource: undefined }) {
            const { accessor, workingCopyBackupService } = await createTracker();
            const untitledTextEditor = disposables.add((await accessor.editorService.openEditor(untitled))?.input);
            const untitledTextModel = disposables.add(await untitledTextEditor.resolve());
            if (!untitled?.contents) {
                untitledTextModel.textEditorModel?.setValue('Super Good');
            }
            await workingCopyBackupService.joinBackupResource();
            assert.strictEqual(workingCopyBackupService.hasBackupSync(untitledTextModel), true);
            untitledTextModel.dispose();
            await workingCopyBackupService.joinDiscardBackup();
            assert.strictEqual(workingCopyBackupService.hasBackupSync(untitledTextModel), false);
        }
        test('Track backups (untitled)', function () {
            return untitledBackupTest();
        });
        test('Track backups (untitled with initial contents)', function () {
            return untitledBackupTest({ resource: undefined, contents: 'Foo Bar' });
        });
        test('Track backups (custom)', async function () {
            const { accessor, tracker, workingCopyBackupService } = await createTracker();
            class TestBackupWorkingCopy extends workbenchTestServices_2.TestWorkingCopy {
                constructor(resource) {
                    super(resource);
                    this.backupDelay = 10;
                    disposables.add(accessor.workingCopyService.registerWorkingCopy(this));
                }
                async backup(token) {
                    await (0, async_1.timeout)(0);
                    return {};
                }
            }
            const resource = utils_1.toResource.call(this, '/path/custom.txt');
            const customWorkingCopy = disposables.add(new TestBackupWorkingCopy(resource));
            // Normal
            customWorkingCopy.setDirty(true);
            assert.strictEqual(tracker.pendingBackupOperationCount, 1);
            await workingCopyBackupService.joinBackupResource();
            assert.strictEqual(workingCopyBackupService.hasBackupSync(customWorkingCopy), true);
            customWorkingCopy.setDirty(false);
            customWorkingCopy.setDirty(true);
            assert.strictEqual(tracker.pendingBackupOperationCount, 1);
            await workingCopyBackupService.joinBackupResource();
            assert.strictEqual(workingCopyBackupService.hasBackupSync(customWorkingCopy), true);
            customWorkingCopy.setDirty(false);
            assert.strictEqual(tracker.pendingBackupOperationCount, 1);
            await workingCopyBackupService.joinDiscardBackup();
            assert.strictEqual(workingCopyBackupService.hasBackupSync(customWorkingCopy), false);
            // Cancellation
            customWorkingCopy.setDirty(true);
            await (0, async_1.timeout)(0);
            customWorkingCopy.setDirty(false);
            assert.strictEqual(tracker.pendingBackupOperationCount, 1);
            await workingCopyBackupService.joinDiscardBackup();
            assert.strictEqual(workingCopyBackupService.hasBackupSync(customWorkingCopy), false);
        });
        async function restoreBackupsInit() {
            const fooFile = uri_1.URI.file(platform_1.isWindows ? 'c:\\Foo' : '/Foo');
            const barFile = uri_1.URI.file(platform_1.isWindows ? 'c:\\Bar' : '/Bar');
            const untitledFile1 = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
            const untitledFile2 = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-2' });
            const workingCopyBackupService = disposables.add(new workbenchTestServices_1.InMemoryTestWorkingCopyBackupService());
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            instantiationService.stub(workingCopyBackup_1.IWorkingCopyBackupService, workingCopyBackupService);
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.EditorService));
            instantiationService.stub(editorService_1.IEditorService, editorService);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            // Backup 2 normal files and 2 untitled files
            const untitledFile1WorkingCopyId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile1);
            const untitledFile2WorkingCopyId = (0, workbenchTestServices_1.toTypedWorkingCopyId)(untitledFile2);
            await workingCopyBackupService.backup(untitledFile1WorkingCopyId, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('untitled-1')));
            await workingCopyBackupService.backup(untitledFile2WorkingCopyId, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('untitled-2')));
            const fooFileWorkingCopyId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
            const barFileWorkingCopyId = (0, workbenchTestServices_1.toTypedWorkingCopyId)(barFile);
            await workingCopyBackupService.backup(fooFileWorkingCopyId, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('fooFile')));
            await workingCopyBackupService.backup(barFileWorkingCopyId, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('barFile')));
            const tracker = disposables.add(instantiationService.createInstance(TestWorkingCopyBackupTracker));
            accessor.lifecycleService.phase = 3 /* LifecyclePhase.Restored */;
            return [tracker, accessor];
        }
        test('Restore backups (basics, some handled)', async function () {
            const [tracker, accessor] = await restoreBackupsInit();
            assert.strictEqual(tracker.getUnrestoredBackups().size, 0);
            let handlesCounter = 0;
            let isOpenCounter = 0;
            let createEditorCounter = 0;
            await tracker.testRestoreBackups({
                handles: workingCopy => {
                    handlesCounter++;
                    return workingCopy.typeId === 'testBackupTypeId';
                },
                isOpen: (workingCopy, editor) => {
                    isOpenCounter++;
                    return false;
                },
                createEditor: workingCopy => {
                    createEditorCounter++;
                    return disposables.add(accessor.instantiationService.createInstance(TestUntitledTextEditorInput, accessor.untitledTextEditorService.create({ initialValue: 'foo' })));
                }
            });
            assert.strictEqual(handlesCounter, 4);
            assert.strictEqual(isOpenCounter, 0);
            assert.strictEqual(createEditorCounter, 2);
            assert.strictEqual(accessor.editorService.count, 2);
            assert.ok(accessor.editorService.editors.every(editor => editor.isDirty()));
            assert.strictEqual(tracker.getUnrestoredBackups().size, 2);
            for (const editor of accessor.editorService.editors) {
                assert.ok(editor instanceof TestUntitledTextEditorInput);
                assert.strictEqual(editor.resolved, true);
            }
        });
        test('Restore backups (basics, none handled)', async function () {
            const [tracker, accessor] = await restoreBackupsInit();
            await tracker.testRestoreBackups({
                handles: workingCopy => false,
                isOpen: (workingCopy, editor) => { throw new Error('unexpected'); },
                createEditor: workingCopy => { throw new Error('unexpected'); }
            });
            assert.strictEqual(accessor.editorService.count, 0);
            assert.strictEqual(tracker.getUnrestoredBackups().size, 4);
        });
        test('Restore backups (basics, error case)', async function () {
            const [tracker] = await restoreBackupsInit();
            try {
                await tracker.testRestoreBackups({
                    handles: workingCopy => true,
                    isOpen: (workingCopy, editor) => { throw new Error('unexpected'); },
                    createEditor: workingCopy => { throw new Error('unexpected'); }
                });
            }
            catch (error) {
                // ignore
            }
            assert.strictEqual(tracker.getUnrestoredBackups().size, 4);
        });
        test('Restore backups (multiple handlers)', async function () {
            const [tracker, accessor] = await restoreBackupsInit();
            const firstHandler = tracker.testRestoreBackups({
                handles: workingCopy => {
                    return workingCopy.typeId === 'testBackupTypeId';
                },
                isOpen: (workingCopy, editor) => {
                    return false;
                },
                createEditor: workingCopy => {
                    return disposables.add(accessor.instantiationService.createInstance(TestUntitledTextEditorInput, accessor.untitledTextEditorService.create({ initialValue: 'foo' })));
                }
            });
            const secondHandler = tracker.testRestoreBackups({
                handles: workingCopy => {
                    return workingCopy.typeId.length === 0;
                },
                isOpen: (workingCopy, editor) => {
                    return false;
                },
                createEditor: workingCopy => {
                    return disposables.add(accessor.instantiationService.createInstance(TestUntitledTextEditorInput, accessor.untitledTextEditorService.create({ initialValue: 'foo' })));
                }
            });
            await Promise.all([firstHandler, secondHandler]);
            assert.strictEqual(accessor.editorService.count, 4);
            assert.ok(accessor.editorService.editors.every(editor => editor.isDirty()));
            assert.strictEqual(tracker.getUnrestoredBackups().size, 0);
            for (const editor of accessor.editorService.editors) {
                assert.ok(editor instanceof TestUntitledTextEditorInput);
                assert.strictEqual(editor.resolved, true);
            }
        });
        test('Restore backups (editors already opened)', async function () {
            const [tracker, accessor] = await restoreBackupsInit();
            assert.strictEqual(tracker.getUnrestoredBackups().size, 0);
            let handlesCounter = 0;
            let isOpenCounter = 0;
            const editor1 = disposables.add(accessor.instantiationService.createInstance(TestUntitledTextEditorInput, accessor.untitledTextEditorService.create({ initialValue: 'foo' })));
            const editor2 = disposables.add(accessor.instantiationService.createInstance(TestUntitledTextEditorInput, accessor.untitledTextEditorService.create({ initialValue: 'foo' })));
            await accessor.editorService.openEditors([{ editor: editor1 }, { editor: editor2 }]);
            editor1.resolved = false;
            editor2.resolved = false;
            await tracker.testRestoreBackups({
                handles: workingCopy => {
                    handlesCounter++;
                    return workingCopy.typeId === 'testBackupTypeId';
                },
                isOpen: (workingCopy, editor) => {
                    isOpenCounter++;
                    return true;
                },
                createEditor: workingCopy => { throw new Error('unexpected'); }
            });
            assert.strictEqual(handlesCounter, 4);
            assert.strictEqual(isOpenCounter, 4);
            assert.strictEqual(accessor.editorService.count, 2);
            assert.strictEqual(tracker.getUnrestoredBackups().size, 2);
            for (const editor of accessor.editorService.editors) {
                assert.ok(editor instanceof TestUntitledTextEditorInput);
                // assert that we only call `resolve` on inactive editors
                if (accessor.editorService.isVisible(editor)) {
                    assert.strictEqual(editor.resolved, false);
                }
                else {
                    assert.strictEqual(editor.resolved, true);
                }
            }
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBUcmFja2VyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya2luZ0NvcHkvdGVzdC9icm93c2VyL3dvcmtpbmdDb3B5QmFja3VwVHJhY2tlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBNkJoRyxLQUFLLENBQUMsb0NBQW9DLEVBQUU7UUFDM0MsSUFBSSxRQUE2QixDQUFDO1FBQ2xDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsa0RBQTBCLEdBQUUsQ0FBQyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ25CLE1BQU0sSUFBQSx5Q0FBaUIsRUFBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUV2RCxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUE2QixTQUFRLDBEQUErQjtZQUV6RSxZQUM0Qix3QkFBbUQsRUFDbEQseUJBQXFELEVBQzVELGtCQUF1QyxFQUN6QyxnQkFBbUMsRUFDekMsVUFBdUIsRUFDVCx3QkFBbUQsRUFDOUQsYUFBNkIsRUFDdkIsa0JBQXdDO2dCQUU5RCxLQUFLLENBQUMsd0JBQXdCLEVBQUUseUJBQXlCLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLHdCQUF3QixFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQzNLLENBQUM7WUFFa0Isc0JBQXNCO2dCQUN4QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLDJCQUEyQjtZ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