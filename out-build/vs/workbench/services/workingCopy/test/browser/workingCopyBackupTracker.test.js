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
        const disposables = new lifecycle_2.$jc();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.$Xec)());
        });
        teardown(async () => {
            await (0, workbenchTestServices_1.$hfc)(accessor.instantiationService);
            disposables.clear();
        });
        let TestWorkingCopyBackupTracker = class TestWorkingCopyBackupTracker extends workingCopyBackupTracker_1.$l4b {
            constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, logService, workingCopyEditorService, editorService, editorGroupService) {
                super(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, logService, workingCopyEditorService, editorService, editorGroupService);
            }
            H() {
                return 10; // Reduce timeout for tests
            }
            get pendingBackupOperationCount() { return this.w.size; }
            getUnrestoredBackups() {
                return this.Q;
            }
            async testRestoreBackups(handler) {
                return super.X(handler);
            }
        };
        TestWorkingCopyBackupTracker = __decorate([
            __param(0, workingCopyBackup_1.$EA),
            __param(1, filesConfigurationService_1.$yD),
            __param(2, workingCopyService_1.$TC),
            __param(3, lifecycle_1.$7y),
            __param(4, log_1.$5i),
            __param(5, workingCopyEditorService_1.$AD),
            __param(6, editorService_1.$9C),
            __param(7, editorGroupsService_1.$5C)
        ], TestWorkingCopyBackupTracker);
        class TestUntitledTextEditorInput extends untitledTextEditorInput_1.$Bvb {
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
            const workingCopyBackupService = disposables.add(new workbenchTestServices_1.$Jec());
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            instantiationService.stub(workingCopyBackup_1.$EA, workingCopyBackupService);
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            disposables.add((0, workbenchTestServices_1.$Xec)());
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.$Lyb));
            instantiationService.stub(editorService_1.$9C, editorService);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
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
            class TestBackupWorkingCopy extends workbenchTestServices_2.$9dc {
                constructor(resource) {
                    super(resource);
                    this.backupDelay = 10;
                    disposables.add(accessor.workingCopyService.registerWorkingCopy(this));
                }
                async backup(token) {
                    await (0, async_1.$Hg)(0);
                    return {};
                }
            }
            const resource = utils_1.$0S.call(this, '/path/custom.txt');
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
            await (0, async_1.$Hg)(0);
            customWorkingCopy.setDirty(false);
            assert.strictEqual(tracker.pendingBackupOperationCount, 1);
            await workingCopyBackupService.joinDiscardBackup();
            assert.strictEqual(workingCopyBackupService.hasBackupSync(customWorkingCopy), false);
        });
        async function restoreBackupsInit() {
            const fooFile = uri_1.URI.file(platform_1.$i ? 'c:\\Foo' : '/Foo');
            const barFile = uri_1.URI.file(platform_1.$i ? 'c:\\Bar' : '/Bar');
            const untitledFile1 = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
            const untitledFile2 = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-2' });
            const workingCopyBackupService = disposables.add(new workbenchTestServices_1.$Jec());
            const instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            instantiationService.stub(workingCopyBackup_1.$EA, workingCopyBackupService);
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.$Lyb));
            instantiationService.stub(editorService_1.$9C, editorService);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            // Backup 2 normal files and 2 untitled files
            const untitledFile1WorkingCopyId = (0, workbenchTestServices_1.$Hec)(untitledFile1);
            const untitledFile2WorkingCopyId = (0, workbenchTestServices_1.$Iec)(untitledFile2);
            await workingCopyBackupService.backup(untitledFile1WorkingCopyId, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('untitled-1')));
            await workingCopyBackupService.backup(untitledFile2WorkingCopyId, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('untitled-2')));
            const fooFileWorkingCopyId = (0, workbenchTestServices_1.$Hec)(fooFile);
            const barFileWorkingCopyId = (0, workbenchTestServices_1.$Iec)(barFile);
            await workingCopyBackupService.backup(fooFileWorkingCopyId, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('fooFile')));
            await workingCopyBackupService.backup(barFileWorkingCopyId, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('barFile')));
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
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=workingCopyBackupTracker.test.js.map