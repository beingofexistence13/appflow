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
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/path", "vs/base/common/uri", "vs/base/common/hash", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupTracker", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/log/common/log", "vs/platform/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/platform/native/common/native", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/environment/common/environment", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/progress/common/progress", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/event", "vs/base/common/uuid", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/buffer", "vs/workbench/test/electron-sandbox/workbenchTestServices", "vs/platform/uriIdentity/common/uriIdentityService"], function (require, exports, assert, platform_1, path_1, uri_1, hash_1, workingCopyBackupTracker_1, editorService_1, editorGroupsService_1, editorService_2, workingCopyBackup_1, lifecycle_1, utils_1, filesConfigurationService_1, workingCopyService_1, log_1, files_1, lifecycle_2, dialogs_1, workspace_1, native_1, testConfigurationService_1, configuration_1, workbenchTestServices_1, mockKeybindingService_1, environment_1, testWorkspace_1, progress_1, workingCopyEditorService_1, workbenchTestServices_2, event_1, uuid_1, network_1, resources_1, buffer_1, workbenchTestServices_3, uriIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WorkingCopyBackupTracker (native)', function () {
        let TestWorkingCopyBackupTracker = class TestWorkingCopyBackupTracker extends workingCopyBackupTracker_1.$4_b {
            constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, editorService, environmentService, progressService, workingCopyEditorService, editorGroupService) {
                super(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, environmentService, progressService, workingCopyEditorService, editorService, editorGroupService);
                this.rb = this.B(new event_1.$fd());
                this.onDidResume = this.rb.event;
                this.sb = this.B(new event_1.$fd());
                this.onDidSuspend = this.sb.event;
            }
            H() {
                return 10; // Reduce timeout for tests
            }
            waitForReady() {
                return super.R;
            }
            get pendingBackupOperationCount() { return this.w.size; }
            dispose() {
                super.dispose();
                for (const [_, pending] of this.w) {
                    pending.cancel();
                    pending.disposable.dispose();
                }
            }
            P() {
                const { resume } = super.P();
                this.sb.fire();
                return {
                    resume: () => {
                        resume();
                        this.rb.fire();
                    }
                };
            }
        };
        TestWorkingCopyBackupTracker = __decorate([
            __param(0, workingCopyBackup_1.$EA),
            __param(1, filesConfigurationService_1.$yD),
            __param(2, workingCopyService_1.$TC),
            __param(3, lifecycle_2.$7y),
            __param(4, dialogs_1.$qA),
            __param(5, dialogs_1.$oA),
            __param(6, workspace_1.$Kh),
            __param(7, native_1.$05b),
            __param(8, log_1.$5i),
            __param(9, editorService_1.$9C),
            __param(10, environment_1.$Ih),
            __param(11, progress_1.$2u),
            __param(12, workingCopyEditorService_1.$AD),
            __param(13, editorGroupsService_1.$5C)
        ], TestWorkingCopyBackupTracker);
        let testDir;
        let backupHome;
        let workspaceBackupPath;
        let accessor;
        const disposables = new lifecycle_1.$jc();
        setup(async () => {
            testDir = uri_1.URI.file((0, path_1.$9d)((0, uuid_1.$4f)(), 'vsctests', 'workingcopybackuptracker')).with({ scheme: network_1.Schemas.inMemory });
            backupHome = (0, resources_1.$ig)(testDir, 'Backups');
            const workspacesJsonPath = (0, resources_1.$ig)(backupHome, 'workspaces.json');
            const workspaceResource = uri_1.URI.file(platform_1.$i ? 'c:\\workspace' : '/workspace').with({ scheme: network_1.Schemas.inMemory });
            workspaceBackupPath = (0, resources_1.$ig)(backupHome, (0, hash_1.$pi)(workspaceResource.toString()).toString(16));
            const instantiationService = (0, workbenchTestServices_3.$zfc)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_3.$Afc);
            disposables.add(accessor.textFileService.files);
            disposables.add((0, workbenchTestServices_1.$Wec)());
            await accessor.fileService.createFolder(backupHome);
            await accessor.fileService.createFolder(workspaceBackupPath);
            return accessor.fileService.writeFile(workspacesJsonPath, buffer_1.$Fd.fromString(''));
        });
        teardown(() => {
            disposables.clear();
        });
        async function createTracker(autoSaveEnabled = false) {
            const instantiationService = (0, workbenchTestServices_3.$zfc)(undefined, disposables);
            const configurationService = new testConfigurationService_1.$G0b();
            if (autoSaveEnabled) {
                configurationService.setUserConfiguration('files', { autoSave: 'afterDelay', autoSaveDelay: 1 });
            }
            instantiationService.stub(configuration_1.$8h, configurationService);
            instantiationService.stub(filesConfigurationService_1.$yD, disposables.add(new workbenchTestServices_1.$Sec(instantiationService.createInstance(mockKeybindingService_1.$S0b), configurationService, new workbenchTestServices_2.$6dc(testWorkspace_1.$$0b), workbenchTestServices_1.$qec, disposables.add(new uriIdentityService_1.$pr(disposables.add(new workbenchTestServices_1.$Fec()))), disposables.add(new workbenchTestServices_1.$Fec()))));
            const part = await (0, workbenchTestServices_1.$3ec)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.$5C, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.$Lyb));
            instantiationService.stub(editorService_1.$9C, editorService);
            accessor = instantiationService.createInstance(workbenchTestServices_3.$Afc);
            const tracker = instantiationService.createInstance(TestWorkingCopyBackupTracker);
            const cleanup = async () => {
                await accessor.workingCopyBackupService.waitForAllBackups(); // File changes could also schedule some backup operations so we need to wait for them before finishing the test
                await (0, workbenchTestServices_1.$hfc)(instantiationService);
                part.dispose();
                tracker.dispose();
            };
            return { accessor, part, tracker, instantiationService, cleanup };
        }
        test('Track backups (file, auto save off)', function () {
            return trackBackupsTest(utils_1.$0S.call(this, '/path/index.txt'), false);
        });
        test('Track backups (file, auto save on)', function () {
            return trackBackupsTest(utils_1.$0S.call(this, '/path/index.txt'), true);
        });
        async function trackBackupsTest(resource, autoSave) {
            const { accessor, cleanup } = await createTracker(autoSave);
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const fileModel = accessor.textFileService.files.get(resource);
            assert.ok(fileModel);
            fileModel.textEditorModel?.setValue('Super Good');
            await accessor.workingCopyBackupService.joinBackupResource();
            assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(fileModel), true);
            fileModel.dispose();
            await accessor.workingCopyBackupService.joinDiscardBackup();
            assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(fileModel), false);
            await cleanup();
        }
        test('onWillShutdown - no veto if no dirty files', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const event = new workbenchTestServices_1.$Lec();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            await cleanup();
        });
        test('onWillShutdown - veto if user cancels (hot.exit: off)', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
            accessor.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: 'off' } });
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            const event = new workbenchTestServices_1.$Lec();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(veto);
            await cleanup();
        });
        test('onWillShutdown - no veto if auto save is on', async function () {
            const { accessor, cleanup } = await createTracker(true /* auto save enabled */);
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            const event = new workbenchTestServices_1.$Lec();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 0);
            await cleanup();
        });
        test('onWillShutdown - no veto and backups cleaned up if user does not want to save (hot.exit: off)', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            accessor.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: 'off' } });
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            const event = new workbenchTestServices_1.$Lec();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.ok(accessor.workingCopyBackupService.discardedBackups.length > 0);
            await cleanup();
        });
        test('onWillShutdown - no backups discarded when shutdown without dirty but tracker not ready', async function () {
            const { accessor, cleanup } = await createTracker();
            const event = new workbenchTestServices_1.$Lec();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.ok(!accessor.workingCopyBackupService.discardedAllBackups);
            await cleanup();
        });
        test('onWillShutdown - backups discarded when shutdown without dirty', async function () {
            const { accessor, tracker, cleanup } = await createTracker();
            await tracker.waitForReady();
            const event = new workbenchTestServices_1.$Lec();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.ok(accessor.workingCopyBackupService.discardedAllBackups);
            await cleanup();
        });
        test('onWillShutdown - save (hot.exit: off)', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            accessor.fileDialogService.setConfirmResult(0 /* ConfirmResult.SAVE */);
            accessor.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: 'off' } });
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            const event = new workbenchTestServices_1.$Lec();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.ok(!model?.isDirty());
            await cleanup();
        });
        test('onWillShutdown - veto if backup fails', async function () {
            const { accessor, cleanup } = await createTracker();
            class TestBackupWorkingCopy extends workbenchTestServices_2.$9dc {
                constructor(resource) {
                    super(resource);
                    this.B(accessor.workingCopyService.registerWorkingCopy(this));
                }
                async backup(token) {
                    throw new Error('unable to backup');
                }
            }
            const resource = utils_1.$0S.call(this, '/path/custom.txt');
            const customWorkingCopy = disposables.add(new TestBackupWorkingCopy(resource));
            customWorkingCopy.setDirty(true);
            const event = new workbenchTestServices_1.$Lec();
            event.reason = 2 /* ShutdownReason.QUIT */;
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(veto);
            const finalVeto = await event.finalValue?.();
            assert.ok(finalVeto); // assert the tracker uses the internal finalVeto API
            await cleanup();
        });
        test('onWillShutdown - scratchpads - veto if backup fails', async function () {
            const { accessor, cleanup } = await createTracker();
            class TestBackupWorkingCopy extends workbenchTestServices_2.$9dc {
                constructor(resource) {
                    super(resource);
                    this.capabilities = 2 /* WorkingCopyCapabilities.Untitled */ | 4 /* WorkingCopyCapabilities.Scratchpad */;
                    this.B(accessor.workingCopyService.registerWorkingCopy(this));
                }
                async backup(token) {
                    throw new Error('unable to backup');
                }
                isDirty() {
                    return false;
                }
                isModified() {
                    return true;
                }
            }
            const resource = utils_1.$0S.call(this, '/path/custom.txt');
            disposables.add(new TestBackupWorkingCopy(resource));
            const event = new workbenchTestServices_1.$Lec();
            event.reason = 2 /* ShutdownReason.QUIT */;
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(veto);
            const finalVeto = await event.finalValue?.();
            assert.ok(finalVeto); // assert the tracker uses the internal finalVeto API
            await cleanup();
        });
        test('onWillShutdown - pending backup operations canceled and tracker suspended/resumsed', async function () {
            const { accessor, tracker, cleanup } = await createTracker();
            const resource = utils_1.$0S.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            assert.strictEqual(tracker.pendingBackupOperationCount, 1);
            const onSuspend = event_1.Event.toPromise(tracker.onDidSuspend);
            const event = new workbenchTestServices_1.$Lec();
            event.reason = 2 /* ShutdownReason.QUIT */;
            accessor.lifecycleService.fireBeforeShutdown(event);
            await onSuspend;
            assert.strictEqual(tracker.pendingBackupOperationCount, 0);
            // Ops are suspended during shutdown!
            model?.textEditorModel?.setValue('bar');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            assert.strictEqual(tracker.pendingBackupOperationCount, 0);
            const onResume = event_1.Event.toPromise(tracker.onDidResume);
            await event.value;
            // Ops are resumed after shutdown!
            model?.textEditorModel?.setValue('foo');
            await onResume;
            assert.strictEqual(tracker.pendingBackupOperationCount, 1);
            await cleanup();
        });
        suite('Hot Exit', () => {
            suite('"onExit" setting', () => {
                test('should hot exit on non-Mac (reason: CLOSE, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, true, !!platform_1.$j);
                });
                test('should hot exit on non-Mac (reason: CLOSE, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, false, !!platform_1.$j);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, true, true);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, false, true);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, true, false);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, false, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, true, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, false, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, true, true);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, false, true);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, true, true);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, false, true);
                });
            });
            suite('"onExitAndWindowClose" setting', () => {
                test('should hot exit (reason: CLOSE, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, true, false);
                });
                test('should hot exit (reason: CLOSE, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, false, !!platform_1.$j);
                });
                test('should hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, true, false);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, false, true);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, true, false);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, false, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, true, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, false, false);
                });
                test('should hot exit (reason: LOAD, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, false, true);
                });
                test('should hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, false, true);
                });
            });
            suite('"onExit" setting - scratchpad', () => {
                test('should hot exit (reason: CLOSE, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, true, false);
                });
                test('should hot exit (reason: CLOSE, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, false, !!platform_1.$j);
                });
                test('should hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, true, false);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, false, true);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, true, false);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, false, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, true, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, false, false);
                });
                test('should hot exit (reason: LOAD, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, false, true);
                });
                test('should hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, false, true);
                });
            });
            suite('"onExitAndWindowClose" setting - scratchpad', () => {
                test('should hot exit (reason: CLOSE, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, true, false);
                });
                test('should hot exit (reason: CLOSE, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, false, !!platform_1.$j);
                });
                test('should hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, true, false);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, false, true);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, true, false);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, false, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, true, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, false, false);
                });
                test('should hot exit (reason: LOAD, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, false, true);
                });
                test('should hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, false, true);
                });
            });
            async function hotExitTest(setting, shutdownReason, multipleWindows, workspace, shouldVeto) {
                const { accessor, cleanup } = await createTracker();
                const resource = utils_1.$0S.call(this, '/path/index.txt');
                await accessor.editorService.openEditor({ resource, options: { pinned: true } });
                const model = accessor.textFileService.files.get(resource);
                // Set hot exit config
                accessor.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: setting } });
                // Set empty workspace if required
                if (!workspace) {
                    accessor.contextService.setWorkspace(new testWorkspace_1.$00b('empty:1508317022751'));
                }
                // Set multiple windows if required
                if (multipleWindows) {
                    accessor.nativeHostService.windowCount = Promise.resolve(2);
                }
                // Set cancel to force a veto if hot exit does not trigger
                accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
                await model?.resolve();
                model?.textEditorModel?.setValue('foo');
                assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
                const event = new workbenchTestServices_1.$Lec();
                event.reason = shutdownReason;
                accessor.lifecycleService.fireBeforeShutdown(event);
                const veto = await event.value;
                assert.ok(typeof event.finalValue === 'function'); // assert the tracker uses the internal finalVeto API
                assert.strictEqual(accessor.workingCopyBackupService.discardedBackups.length, 0); // When hot exit is set, backups should never be cleaned since the confirm result is cancel
                assert.strictEqual(veto, shouldVeto);
                await cleanup();
            }
            async function scratchpadHotExitTest(setting, shutdownReason, multipleWindows, workspace, shouldVeto) {
                const { accessor, cleanup } = await createTracker();
                class TestBackupWorkingCopy extends workbenchTestServices_2.$9dc {
                    constructor(resource) {
                        super(resource);
                        this.capabilities = 2 /* WorkingCopyCapabilities.Untitled */ | 4 /* WorkingCopyCapabilities.Scratchpad */;
                        this.B(accessor.workingCopyService.registerWorkingCopy(this));
                    }
                    isDirty() {
                        return false;
                    }
                    isModified() {
                        return true;
                    }
                }
                // Set hot exit config
                accessor.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: setting } });
                // Set empty workspace if required
                if (!workspace) {
                    accessor.contextService.setWorkspace(new testWorkspace_1.$00b('empty:1508317022751'));
                }
                // Set multiple windows if required
                if (multipleWindows) {
                    accessor.nativeHostService.windowCount = Promise.resolve(2);
                }
                // Set cancel to force a veto if hot exit does not trigger
                accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
                const resource = utils_1.$0S.call(this, '/path/custom.txt');
                disposables.add(new TestBackupWorkingCopy(resource));
                const event = new workbenchTestServices_1.$Lec();
                event.reason = shutdownReason;
                accessor.lifecycleService.fireBeforeShutdown(event);
                const veto = await event.value;
                assert.ok(typeof event.finalValue === 'function'); // assert the tracker uses the internal finalVeto API
                assert.strictEqual(accessor.workingCopyBackupService.discardedBackups.length, 0); // When hot exit is set, backups should never be cleaned since the confirm result is cancel
                assert.strictEqual(veto, shouldVeto);
                await cleanup();
            }
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=workingCopyBackupTracker.test.js.map