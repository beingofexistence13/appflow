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
        let TestWorkingCopyBackupTracker = class TestWorkingCopyBackupTracker extends workingCopyBackupTracker_1.NativeWorkingCopyBackupTracker {
            constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, editorService, environmentService, progressService, workingCopyEditorService, editorGroupService) {
                super(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, environmentService, progressService, workingCopyEditorService, editorService, editorGroupService);
                this._onDidResume = this._register(new event_1.Emitter());
                this.onDidResume = this._onDidResume.event;
                this._onDidSuspend = this._register(new event_1.Emitter());
                this.onDidSuspend = this._onDidSuspend.event;
            }
            getBackupScheduleDelay() {
                return 10; // Reduce timeout for tests
            }
            waitForReady() {
                return super.whenReady;
            }
            get pendingBackupOperationCount() { return this.pendingBackupOperations.size; }
            dispose() {
                super.dispose();
                for (const [_, pending] of this.pendingBackupOperations) {
                    pending.cancel();
                    pending.disposable.dispose();
                }
            }
            suspendBackupOperations() {
                const { resume } = super.suspendBackupOperations();
                this._onDidSuspend.fire();
                return {
                    resume: () => {
                        resume();
                        this._onDidResume.fire();
                    }
                };
            }
        };
        TestWorkingCopyBackupTracker = __decorate([
            __param(0, workingCopyBackup_1.IWorkingCopyBackupService),
            __param(1, filesConfigurationService_1.IFilesConfigurationService),
            __param(2, workingCopyService_1.IWorkingCopyService),
            __param(3, lifecycle_2.ILifecycleService),
            __param(4, dialogs_1.IFileDialogService),
            __param(5, dialogs_1.IDialogService),
            __param(6, workspace_1.IWorkspaceContextService),
            __param(7, native_1.INativeHostService),
            __param(8, log_1.ILogService),
            __param(9, editorService_1.IEditorService),
            __param(10, environment_1.IEnvironmentService),
            __param(11, progress_1.IProgressService),
            __param(12, workingCopyEditorService_1.IWorkingCopyEditorService),
            __param(13, editorGroupsService_1.IEditorGroupsService)
        ], TestWorkingCopyBackupTracker);
        let testDir;
        let backupHome;
        let workspaceBackupPath;
        let accessor;
        const disposables = new lifecycle_1.DisposableStore();
        setup(async () => {
            testDir = uri_1.URI.file((0, path_1.join)((0, uuid_1.generateUuid)(), 'vsctests', 'workingcopybackuptracker')).with({ scheme: network_1.Schemas.inMemory });
            backupHome = (0, resources_1.joinPath)(testDir, 'Backups');
            const workspacesJsonPath = (0, resources_1.joinPath)(backupHome, 'workspaces.json');
            const workspaceResource = uri_1.URI.file(platform_1.isWindows ? 'c:\\workspace' : '/workspace').with({ scheme: network_1.Schemas.inMemory });
            workspaceBackupPath = (0, resources_1.joinPath)(backupHome, (0, hash_1.hash)(workspaceResource.toString()).toString(16));
            const instantiationService = (0, workbenchTestServices_3.workbenchInstantiationService)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_3.TestServiceAccessor);
            disposables.add(accessor.textFileService.files);
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
            await accessor.fileService.createFolder(backupHome);
            await accessor.fileService.createFolder(workspaceBackupPath);
            return accessor.fileService.writeFile(workspacesJsonPath, buffer_1.VSBuffer.fromString(''));
        });
        teardown(() => {
            disposables.clear();
        });
        async function createTracker(autoSaveEnabled = false) {
            const instantiationService = (0, workbenchTestServices_3.workbenchInstantiationService)(undefined, disposables);
            const configurationService = new testConfigurationService_1.TestConfigurationService();
            if (autoSaveEnabled) {
                configurationService.setUserConfiguration('files', { autoSave: 'afterDelay', autoSaveDelay: 1 });
            }
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(filesConfigurationService_1.IFilesConfigurationService, disposables.add(new workbenchTestServices_1.TestFilesConfigurationService(instantiationService.createInstance(mockKeybindingService_1.MockContextKeyService), configurationService, new workbenchTestServices_2.TestContextService(testWorkspace_1.TestWorkspace), workbenchTestServices_1.TestEnvironmentService, disposables.add(new uriIdentityService_1.UriIdentityService(disposables.add(new workbenchTestServices_1.TestFileService()))), disposables.add(new workbenchTestServices_1.TestFileService()))));
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = disposables.add(instantiationService.createInstance(editorService_2.EditorService));
            instantiationService.stub(editorService_1.IEditorService, editorService);
            accessor = instantiationService.createInstance(workbenchTestServices_3.TestServiceAccessor);
            const tracker = instantiationService.createInstance(TestWorkingCopyBackupTracker);
            const cleanup = async () => {
                await accessor.workingCopyBackupService.waitForAllBackups(); // File changes could also schedule some backup operations so we need to wait for them before finishing the test
                await (0, workbenchTestServices_1.workbenchTeardown)(instantiationService);
                part.dispose();
                tracker.dispose();
            };
            return { accessor, part, tracker, instantiationService, cleanup };
        }
        test('Track backups (file, auto save off)', function () {
            return trackBackupsTest(utils_1.toResource.call(this, '/path/index.txt'), false);
        });
        test('Track backups (file, auto save on)', function () {
            return trackBackupsTest(utils_1.toResource.call(this, '/path/index.txt'), true);
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
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            await cleanup();
        });
        test('onWillShutdown - veto if user cancels (hot.exit: off)', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
            accessor.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: 'off' } });
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(veto);
            await cleanup();
        });
        test('onWillShutdown - no veto if auto save is on', async function () {
            const { accessor, cleanup } = await createTracker(true /* auto save enabled */);
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 0);
            await cleanup();
        });
        test('onWillShutdown - no veto and backups cleaned up if user does not want to save (hot.exit: off)', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            accessor.fileDialogService.setConfirmResult(1 /* ConfirmResult.DONT_SAVE */);
            accessor.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: 'off' } });
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.ok(accessor.workingCopyBackupService.discardedBackups.length > 0);
            await cleanup();
        });
        test('onWillShutdown - no backups discarded when shutdown without dirty but tracker not ready', async function () {
            const { accessor, cleanup } = await createTracker();
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.ok(!accessor.workingCopyBackupService.discardedAllBackups);
            await cleanup();
        });
        test('onWillShutdown - backups discarded when shutdown without dirty', async function () {
            const { accessor, tracker, cleanup } = await createTracker();
            await tracker.waitForReady();
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.ok(accessor.workingCopyBackupService.discardedAllBackups);
            await cleanup();
        });
        test('onWillShutdown - save (hot.exit: off)', async function () {
            const { accessor, cleanup } = await createTracker();
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            accessor.fileDialogService.setConfirmResult(0 /* ConfirmResult.SAVE */);
            accessor.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: 'off' } });
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
            accessor.lifecycleService.fireBeforeShutdown(event);
            const veto = await event.value;
            assert.ok(!veto);
            assert.ok(!model?.isDirty());
            await cleanup();
        });
        test('onWillShutdown - veto if backup fails', async function () {
            const { accessor, cleanup } = await createTracker();
            class TestBackupWorkingCopy extends workbenchTestServices_2.TestWorkingCopy {
                constructor(resource) {
                    super(resource);
                    this._register(accessor.workingCopyService.registerWorkingCopy(this));
                }
                async backup(token) {
                    throw new Error('unable to backup');
                }
            }
            const resource = utils_1.toResource.call(this, '/path/custom.txt');
            const customWorkingCopy = disposables.add(new TestBackupWorkingCopy(resource));
            customWorkingCopy.setDirty(true);
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
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
            class TestBackupWorkingCopy extends workbenchTestServices_2.TestWorkingCopy {
                constructor(resource) {
                    super(resource);
                    this.capabilities = 2 /* WorkingCopyCapabilities.Untitled */ | 4 /* WorkingCopyCapabilities.Scratchpad */;
                    this._register(accessor.workingCopyService.registerWorkingCopy(this));
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
            const resource = utils_1.toResource.call(this, '/path/custom.txt');
            disposables.add(new TestBackupWorkingCopy(resource));
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
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
            const resource = utils_1.toResource.call(this, '/path/index.txt');
            await accessor.editorService.openEditor({ resource, options: { pinned: true } });
            const model = accessor.textFileService.files.get(resource);
            await model?.resolve();
            model?.textEditorModel?.setValue('foo');
            assert.strictEqual(accessor.workingCopyService.dirtyCount, 1);
            assert.strictEqual(tracker.pendingBackupOperationCount, 1);
            const onSuspend = event_1.Event.toPromise(tracker.onDidSuspend);
            const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
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
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, true, !!platform_1.isMacintosh);
                });
                test('should hot exit on non-Mac (reason: CLOSE, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, false, !!platform_1.isMacintosh);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, true, true);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, false, true);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, true, false);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, false, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, true, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, false, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, true, true);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, false, true);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, true, true);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, false, true);
                });
            });
            suite('"onExitAndWindowClose" setting', () => {
                test('should hot exit (reason: CLOSE, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, true, false);
                });
                test('should hot exit (reason: CLOSE, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, false, !!platform_1.isMacintosh);
                });
                test('should hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, true, false);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, false, true);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, true, false);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, false, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, true, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, false, false);
                });
                test('should hot exit (reason: LOAD, windows: single, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, false, true);
                });
                test('should hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                    return hotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, false, true);
                });
            });
            suite('"onExit" setting - scratchpad', () => {
                test('should hot exit (reason: CLOSE, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, true, false);
                });
                test('should hot exit (reason: CLOSE, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, false, false, !!platform_1.isMacintosh);
                });
                test('should hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, true, false);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 1 /* ShutdownReason.CLOSE */, true, false, true);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, true, false);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, false, false, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, true, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 2 /* ShutdownReason.QUIT */, true, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, false, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 3 /* ShutdownReason.RELOAD */, true, false, false);
                });
                test('should hot exit (reason: LOAD, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, false, false, true);
                });
                test('should hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT, 4 /* ShutdownReason.LOAD */, true, false, true);
                });
            });
            suite('"onExitAndWindowClose" setting - scratchpad', () => {
                test('should hot exit (reason: CLOSE, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, true, false);
                });
                test('should hot exit (reason: CLOSE, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, false, false, !!platform_1.isMacintosh);
                });
                test('should hot exit (reason: CLOSE, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, true, false);
                });
                test('should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 1 /* ShutdownReason.CLOSE */, true, false, true);
                });
                test('should hot exit (reason: QUIT, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, true, false);
                });
                test('should hot exit (reason: QUIT, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, false, false, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, true, false);
                });
                test('should hot exit (reason: QUIT, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 2 /* ShutdownReason.QUIT */, true, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, false, false, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, true, false);
                });
                test('should hot exit (reason: RELOAD, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 3 /* ShutdownReason.RELOAD */, true, false, false);
                });
                test('should hot exit (reason: LOAD, windows: single, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: single, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, false, false, true);
                });
                test('should hot exit (reason: LOAD, windows: multiple, workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, true, false);
                });
                test('should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)', function () {
                    return scratchpadHotExitTest.call(this, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE, 4 /* ShutdownReason.LOAD */, true, false, true);
                });
            });
            async function hotExitTest(setting, shutdownReason, multipleWindows, workspace, shouldVeto) {
                const { accessor, cleanup } = await createTracker();
                const resource = utils_1.toResource.call(this, '/path/index.txt');
                await accessor.editorService.openEditor({ resource, options: { pinned: true } });
                const model = accessor.textFileService.files.get(resource);
                // Set hot exit config
                accessor.filesConfigurationService.testOnFilesConfigurationChange({ files: { hotExit: setting } });
                // Set empty workspace if required
                if (!workspace) {
                    accessor.contextService.setWorkspace(new testWorkspace_1.Workspace('empty:1508317022751'));
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
                const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
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
                class TestBackupWorkingCopy extends workbenchTestServices_2.TestWorkingCopy {
                    constructor(resource) {
                        super(resource);
                        this.capabilities = 2 /* WorkingCopyCapabilities.Untitled */ | 4 /* WorkingCopyCapabilities.Scratchpad */;
                        this._register(accessor.workingCopyService.registerWorkingCopy(this));
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
                    accessor.contextService.setWorkspace(new testWorkspace_1.Workspace('empty:1508317022751'));
                }
                // Set multiple windows if required
                if (multipleWindows) {
                    accessor.nativeHostService.windowCount = Promise.resolve(2);
                }
                // Set cancel to force a veto if hot exit does not trigger
                accessor.fileDialogService.setConfirmResult(2 /* ConfirmResult.CANCEL */);
                const resource = utils_1.toResource.call(this, '/path/custom.txt');
                disposables.add(new TestBackupWorkingCopy(resource));
                const event = new workbenchTestServices_1.TestBeforeShutdownEvent();
                event.reason = shutdownReason;
                accessor.lifecycleService.fireBeforeShutdown(event);
                const veto = await event.value;
                assert.ok(typeof event.finalValue === 'function'); // assert the tracker uses the internal finalVeto API
                assert.strictEqual(accessor.workingCopyBackupService.discardedBackups.length, 0); // When hot exit is set, backups should never be cleaned since the confirm result is cancel
                assert.strictEqual(veto, shouldVeto);
                await cleanup();
            }
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBUcmFja2VyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya2luZ0NvcHkvdGVzdC9lbGVjdHJvbi1zYW5kYm94L3dvcmtpbmdDb3B5QmFja3VwVHJhY2tlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBNkNoRyxLQUFLLENBQUMsbUNBQW1DLEVBQUU7UUFFMUMsSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNkIsU0FBUSx5REFBOEI7WUFFeEUsWUFDNEIsd0JBQW1ELEVBQ2xELHlCQUFxRCxFQUM1RCxrQkFBdUMsRUFDekMsZ0JBQW1DLEVBQ2xDLGlCQUFxQyxFQUN6QyxhQUE2QixFQUNuQixjQUF3QyxFQUM5QyxpQkFBcUMsRUFDNUMsVUFBdUIsRUFDcEIsYUFBNkIsRUFDeEIsa0JBQXVDLEVBQzFDLGVBQWlDLEVBQ3hCLHdCQUFtRCxFQUN4RCxrQkFBd0M7Z0JBRTlELEtBQUssQ0FBQyx3QkFBd0IsRUFBRSx5QkFBeUIsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsd0JBQXdCLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBc0JwUSxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO2dCQUMzRCxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO2dCQUU5QixrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO2dCQUM1RCxpQkFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1lBekJqRCxDQUFDO1lBRWtCLHNCQUFzQjtnQkFDeEMsT0FBTyxFQUFFLENBQUMsQ0FBQywyQkFBMkI7WUFDdkMsQ0FBQztZQUVELFlBQVk7Z0JBQ1gsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ3hCLENBQUM7WUFFRCxJQUFJLDJCQUEyQixLQUFhLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFOUUsT0FBTztnQkFDZixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRWhCLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7b0JBQ3hELE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDakIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDN0I7WUFDRixDQUFDO1lBUWtCLHVCQUF1QjtnQkFDekMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUVuRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUUxQixPQUFPO29CQUNOLE1BQU0sRUFBRSxHQUFHLEVBQUU7d0JBQ1osTUFBTSxFQUFFLENBQUM7d0JBRVQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDMUIsQ0FBQztpQkFDRCxDQUFDO1lBQ0gsQ0FBQztTQUNELENBQUE7UUEzREssNEJBQTRCO1lBRy9CLFdBQUEsNkNBQXlCLENBQUE7WUFDekIsV0FBQSxzREFBMEIsQ0FBQTtZQUMxQixXQUFBLHdDQUFtQixDQUFBO1lBQ25CLFdBQUEsNkJBQWlCLENBQUE7WUFDakIsV0FBQSw0QkFBa0IsQ0FBQTtZQUNsQixXQUFBLHdCQUFjLENBQUE7WUFDZCxXQUFBLG9DQUF3QixDQUFBO1lBQ3hCLFdBQUEsMkJBQWtCLENBQUE7WUFDbEIsV0FBQSxpQkFBVyxDQUFBO1lBQ1gsV0FBQSw4QkFBYyxDQUFBO1lBQ2QsWUFBQSxpQ0FBbUIsQ0FBQTtZQUNuQixZQUFBLDJCQUFnQixDQUFBO1lBQ2hCLFlBQUEsb0RBQXlCLENBQUE7WUFDekIsWUFBQSwwQ0FBb0IsQ0FBQTtXQWhCakIsNEJBQTRCLENBMkRqQztRQUVELElBQUksT0FBWSxDQUFDO1FBQ2pCLElBQUksVUFBZSxDQUFDO1FBQ3BCLElBQUksbUJBQXdCLENBQUM7UUFFN0IsSUFBSSxRQUE2QixDQUFDO1FBRWxDLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNoQixPQUFPLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFBLFdBQUksRUFBQyxJQUFBLG1CQUFZLEdBQUUsRUFBRSxVQUFVLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDcEgsVUFBVSxHQUFHLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDMUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLG9CQUFRLEVBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFFbkUsTUFBTSxpQkFBaUIsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLG9CQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLGlCQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsSCxtQkFBbUIsR0FBRyxJQUFBLG9CQUFRLEVBQUMsVUFBVSxFQUFFLElBQUEsV0FBSSxFQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFNUYsTUFBTSxvQkFBb0IsR0FBRyxJQUFBLHFEQUE2QixFQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNuRixRQUFRLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJDQUFtQixDQUFDLENBQUM7WUFDcEUsV0FBVyxDQUFDLEdBQUcsQ0FBOEIsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFNLENBQUMsQ0FBQztZQUU5RSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsOENBQXNCLEdBQUUsQ0FBQyxDQUFDO1lBRTFDLE1BQU0sUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEQsTUFBTSxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBRTdELE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLFVBQVUsYUFBYSxDQUFDLGVBQWUsR0FBRyxLQUFLO1lBQ25ELE1BQU0sb0JBQW9CLEdBQUcsSUFBQSxxREFBNkIsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFbkYsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7WUFDNUQsSUFBSSxlQUFlLEVBQUU7Z0JBQ3BCLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDakc7WUFDRCxvQkFBb0IsQ0FBQyxJQUFJLENBQUMscUNBQXFCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUV2RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsc0RBQTBCLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHFEQUE2QixDQUNsRixvQkFBb0IsQ0FBQyxjQUFjLENBQUMsNkNBQXFCLENBQUMsRUFDOUUsb0JBQW9CLEVBQ3BCLElBQUksMENBQWtCLENBQUMsNkJBQWEsQ0FBQyxFQUNyQyw4Q0FBc0IsRUFDdEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHVDQUFrQixDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSx1Q0FBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQy9FLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSx1Q0FBZSxFQUFFLENBQUMsQ0FDdEMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsd0NBQWdCLEVBQUMsb0JBQW9CLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDBDQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXRELE1BQU0sYUFBYSxHQUFrQixXQUFXLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw2QkFBYSxDQUFDLENBQUMsQ0FBQztZQUN6RyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsOEJBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUV6RCxRQUFRLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDJDQUFtQixDQUFDLENBQUM7WUFFcEUsTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFFbEYsTUFBTSxPQUFPLEdBQUcsS0FBSyxJQUFJLEVBQUU7Z0JBQzFCLE1BQU0sUUFBUSxDQUFDLHdCQUF3QixDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxnSEFBZ0g7Z0JBRTdLLE1BQU0sSUFBQSx5Q0FBaUIsRUFBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUU5QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2YsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQztZQUVGLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsQ0FBQztRQUNuRSxDQUFDO1FBRUQsSUFBSSxDQUFDLHFDQUFxQyxFQUFFO1lBQzNDLE9BQU8sZ0JBQWdCLENBQUMsa0JBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsb0NBQW9DLEVBQUU7WUFDMUMsT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxRQUFhLEVBQUUsUUFBaUI7WUFDL0QsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU1RCxNQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFakYsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckIsU0FBUyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFbEQsTUFBTSxRQUFRLENBQUMsd0JBQXdCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUU3RCxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFckYsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRXBCLE1BQU0sUUFBUSxDQUFDLHdCQUF3QixDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFNUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXRGLE1BQU0sT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksQ0FBQyw0Q0FBNEMsRUFBRSxLQUFLO1lBQ3ZELE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQztZQUVwRCxNQUFNLFFBQVEsR0FBRyxrQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUMxRCxNQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFakYsTUFBTSxLQUFLLEdBQUcsSUFBSSwrQ0FBdUIsRUFBRSxDQUFDO1lBQzVDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVwRCxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDL0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWpCLE1BQU0sT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdURBQXVELEVBQUUsS0FBSztZQUNsRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sYUFBYSxFQUFFLENBQUM7WUFFcEQsTUFBTSxRQUFRLEdBQUcsa0JBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDMUQsTUFBTSxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWpGLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUzRCxRQUFRLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLDhCQUFzQixDQUFDO1lBQ2xFLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFakcsTUFBTSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDdkIsS0FBSyxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTlELE1BQU0sS0FBSyxHQUFHLElBQUksK0NBQXVCLEVBQUUsQ0FBQztZQUM1QyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFcEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFaEIsTUFBTSxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw2Q0FBNkMsRUFBRSxLQUFLO1lBQ3hELE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFFaEYsTUFBTSxRQUFRLEdBQUcsa0JBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDMUQsTUFBTSxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWpGLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUzRCxNQUFNLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUN2QixLQUFLLEVBQUUsZUFBZSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFOUQsTUFBTSxLQUFLLEdBQUcsSUFBSSwrQ0FBdUIsRUFBRSxDQUFDO1lBQzVDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVwRCxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDL0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWpCLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU5RCxNQUFNLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLCtGQUErRixFQUFFLEtBQUs7WUFDMUcsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLGFBQWEsRUFBRSxDQUFDO1lBRXBELE1BQU0sUUFBUSxHQUFHLGtCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzFELE1BQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVqRixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFM0QsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixpQ0FBeUIsQ0FBQztZQUNyRSxRQUFRLENBQUMseUJBQXlCLENBQUMsOEJBQThCLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWpHLE1BQU0sS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLEtBQUssRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RCxNQUFNLEtBQUssR0FBRyxJQUFJLCtDQUF1QixFQUFFLENBQUM7WUFDNUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBELE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMvQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXpFLE1BQU0sT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMseUZBQXlGLEVBQUUsS0FBSztZQUNwRyxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sYUFBYSxFQUFFLENBQUM7WUFFcEQsTUFBTSxLQUFLLEdBQUcsSUFBSSwrQ0FBdUIsRUFBRSxDQUFDO1lBQzVDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVwRCxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDL0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pCLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUVsRSxNQUFNLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdFQUFnRSxFQUFFLEtBQUs7WUFDM0UsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQztZQUU3RCxNQUFNLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUU3QixNQUFNLEtBQUssR0FBRyxJQUFJLCtDQUF1QixFQUFFLENBQUM7WUFDNUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBELE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMvQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUVqRSxNQUFNLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHVDQUF1QyxFQUFFLEtBQUs7WUFDbEQsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLGFBQWEsRUFBRSxDQUFDO1lBRXBELE1BQU0sUUFBUSxHQUFHLGtCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzFELE1BQU0sUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVqRixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFM0QsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQiw0QkFBb0IsQ0FBQztZQUNoRSxRQUFRLENBQUMseUJBQXlCLENBQUMsOEJBQThCLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWpHLE1BQU0sS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLEtBQUssRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RCxNQUFNLEtBQUssR0FBRyxJQUFJLCtDQUF1QixFQUFFLENBQUM7WUFDNUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBELE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMvQixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRTdCLE1BQU0sT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdUNBQXVDLEVBQUUsS0FBSztZQUNsRCxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sYUFBYSxFQUFFLENBQUM7WUFFcEQsTUFBTSxxQkFBc0IsU0FBUSx1Q0FBZTtnQkFFbEQsWUFBWSxRQUFhO29CQUN4QixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRWhCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZFLENBQUM7Z0JBRVEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUF3QjtvQkFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO2FBQ0Q7WUFFRCxNQUFNLFFBQVEsR0FBRyxrQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUMzRCxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQy9FLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVqQyxNQUFNLEtBQUssR0FBRyxJQUFJLCtDQUF1QixFQUFFLENBQUM7WUFDNUMsS0FBSyxDQUFDLE1BQU0sOEJBQXNCLENBQUM7WUFDbkMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBELE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMvQixNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWhCLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7WUFDN0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHFEQUFxRDtZQUUzRSxNQUFNLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFEQUFxRCxFQUFFLEtBQUs7WUFDaEUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLGFBQWEsRUFBRSxDQUFDO1lBRXBELE1BQU0scUJBQXNCLFNBQVEsdUNBQWU7Z0JBRWxELFlBQVksUUFBYTtvQkFDeEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUtSLGlCQUFZLEdBQUcscUZBQXFFLENBQUM7b0JBSDdGLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZFLENBQUM7Z0JBSVEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUF3QjtvQkFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO2dCQUVRLE9BQU87b0JBQ2YsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQztnQkFFUSxVQUFVO29CQUNsQixPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDO2FBQ0Q7WUFFRCxNQUFNLFFBQVEsR0FBRyxrQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUMzRCxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUkscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUVyRCxNQUFNLEtBQUssR0FBRyxJQUFJLCtDQUF1QixFQUFFLENBQUM7WUFDNUMsS0FBSyxDQUFDLE1BQU0sOEJBQXNCLENBQUM7WUFDbkMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBELE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMvQixNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWhCLE1BQU0sU0FBUyxHQUFHLE1BQU0sS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7WUFDN0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHFEQUFxRDtZQUUzRSxNQUFNLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG9GQUFvRixFQUFFLEtBQUs7WUFDL0YsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQztZQUU3RCxNQUFNLFFBQVEsR0FBRyxrQkFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUMxRCxNQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFakYsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTNELE1BQU0sS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLEtBQUssRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUzRCxNQUFNLFNBQVMsR0FBRyxhQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUV4RCxNQUFNLEtBQUssR0FBRyxJQUFJLCtDQUF1QixFQUFFLENBQUM7WUFDNUMsS0FBSyxDQUFDLE1BQU0sOEJBQXNCLENBQUM7WUFDbkMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXBELE1BQU0sU0FBUyxDQUFDO1lBRWhCLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTNELHFDQUFxQztZQUNyQyxLQUFLLEVBQUUsZUFBZSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFM0QsTUFBTSxRQUFRLEdBQUcsYUFBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEQsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDO1lBRWxCLGtDQUFrQztZQUNsQyxLQUFLLEVBQUUsZUFBZSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxNQUFNLFFBQVEsQ0FBQztZQUNmLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTNELE1BQU0sT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtZQUN0QixLQUFLLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO2dCQUM5QixJQUFJLENBQUMsd0VBQXdFLEVBQUU7b0JBQzlFLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsT0FBTyxnQ0FBd0IsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsc0JBQVcsQ0FBQyxDQUFDO2dCQUMvRyxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsOEVBQThFLEVBQUU7b0JBQ3BGLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsT0FBTyxnQ0FBd0IsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsc0JBQVcsQ0FBQyxDQUFDO2dCQUNoSCxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsbUVBQW1FLEVBQUU7b0JBQ3pFLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsT0FBTyxnQ0FBd0IsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDckcsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLHlFQUF5RSxFQUFFO29CQUMvRSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sZ0NBQXdCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3RHLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw0REFBNEQsRUFBRTtvQkFDbEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyxPQUFPLCtCQUF1QixLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN0RyxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsa0VBQWtFLEVBQUU7b0JBQ3hFLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsT0FBTywrQkFBdUIsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkcsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLDhEQUE4RCxFQUFFO29CQUNwRSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3JHLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxvRUFBb0UsRUFBRTtvQkFDMUUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyxPQUFPLCtCQUF1QixJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN0RyxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsOERBQThELEVBQUU7b0JBQ3BFLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsT0FBTyxpQ0FBeUIsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDeEcsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLG9FQUFvRSxFQUFFO29CQUMxRSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8saUNBQXlCLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3pHLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxnRUFBZ0UsRUFBRTtvQkFDdEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyxPQUFPLGlDQUF5QixJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN2RyxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsc0VBQXNFLEVBQUU7b0JBQzVFLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsT0FBTyxpQ0FBeUIsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDeEcsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLGdFQUFnRSxFQUFFO29CQUN0RSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3JHLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxzRUFBc0UsRUFBRTtvQkFDNUUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyxPQUFPLCtCQUF1QixLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN0RyxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsa0VBQWtFLEVBQUU7b0JBQ3hFLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsT0FBTywrQkFBdUIsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDcEcsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLHdFQUF3RSxFQUFFO29CQUM5RSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3JHLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSCxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO2dCQUM1QyxJQUFJLENBQUMsNkRBQTZELEVBQUU7b0JBQ25FLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsd0JBQXdCLGdDQUF3QixLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN4SCxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsbUVBQW1FLEVBQUU7b0JBQ3pFLE9BQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsd0JBQXdCLGdDQUF3QixLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxzQkFBVyxDQUFDLENBQUM7Z0JBQ2pJLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQywrREFBK0QsRUFBRTtvQkFDckUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsZ0NBQXdCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyx5RUFBeUUsRUFBRTtvQkFDL0UsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsZ0NBQXdCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw0REFBNEQsRUFBRTtvQkFDbEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxrRUFBa0UsRUFBRTtvQkFDeEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3hILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw4REFBOEQsRUFBRTtvQkFDcEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3RILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxvRUFBb0UsRUFBRTtvQkFDMUUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw4REFBOEQsRUFBRTtvQkFDcEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsaUNBQXlCLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3pILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxvRUFBb0UsRUFBRTtvQkFDMUUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsaUNBQXlCLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzFILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxnRUFBZ0UsRUFBRTtvQkFDdEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsaUNBQXlCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3hILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxzRUFBc0UsRUFBRTtvQkFDNUUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsaUNBQXlCLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3pILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw0REFBNEQsRUFBRTtvQkFDbEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3ZILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxzRUFBc0UsRUFBRTtvQkFDNUUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw4REFBOEQsRUFBRTtvQkFDcEUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3RILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyx3RUFBd0UsRUFBRTtvQkFDOUUsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3RILENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSCxLQUFLLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsNkRBQTZELEVBQUU7b0JBQ25FLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyxPQUFPLGdDQUF3QixLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqSCxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsbUVBQW1FLEVBQUU7b0JBQ3pFLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyxPQUFPLGdDQUF3QixLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxzQkFBVyxDQUFDLENBQUM7Z0JBQzFILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQywrREFBK0QsRUFBRTtvQkFDckUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sZ0NBQXdCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyx5RUFBeUUsRUFBRTtvQkFDL0UsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sZ0NBQXdCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw0REFBNEQsRUFBRTtvQkFDbEUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxrRUFBa0UsRUFBRTtvQkFDeEUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw4REFBOEQsRUFBRTtvQkFDcEUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQy9HLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxvRUFBb0UsRUFBRTtvQkFDMUUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw4REFBOEQsRUFBRTtvQkFDcEUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8saUNBQXlCLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2xILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxvRUFBb0UsRUFBRTtvQkFDMUUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8saUNBQXlCLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ25ILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxnRUFBZ0UsRUFBRTtvQkFDdEUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8saUNBQXlCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxzRUFBc0UsRUFBRTtvQkFDNUUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8saUNBQXlCLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2xILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw0REFBNEQsRUFBRTtvQkFDbEUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxzRUFBc0UsRUFBRTtvQkFDNUUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hILENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw4REFBOEQsRUFBRTtvQkFDcEUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQy9HLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyx3RUFBd0UsRUFBRTtvQkFDOUUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLE9BQU8sK0JBQXVCLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9HLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSCxLQUFLLENBQUMsNkNBQTZDLEVBQUUsR0FBRyxFQUFFO2dCQUN6RCxJQUFJLENBQUMsNkRBQTZELEVBQUU7b0JBQ25FLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsZ0NBQXdCLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2xJLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxtRUFBbUUsRUFBRTtvQkFDekUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLHdCQUF3QixnQ0FBd0IsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsc0JBQVcsQ0FBQyxDQUFDO2dCQUMzSSxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsK0RBQStELEVBQUU7b0JBQ3JFLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsZ0NBQXdCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pJLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyx5RUFBeUUsRUFBRTtvQkFDL0UsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLHdCQUF3QixnQ0FBd0IsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDakksQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLDREQUE0RCxFQUFFO29CQUNsRSxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsd0JBQXdCLCtCQUF1QixLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqSSxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsa0VBQWtFLEVBQUU7b0JBQ3hFLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2xJLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw4REFBOEQsRUFBRTtvQkFDcEUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLHdCQUF3QiwrQkFBdUIsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDaEksQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLG9FQUFvRSxFQUFFO29CQUMxRSxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsd0JBQXdCLCtCQUF1QixJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqSSxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsOERBQThELEVBQUU7b0JBQ3BFLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsaUNBQXlCLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ25JLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxvRUFBb0UsRUFBRTtvQkFDMUUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLHdCQUF3QixpQ0FBeUIsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEksQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLGdFQUFnRSxFQUFFO29CQUN0RSxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsd0JBQXdCLGlDQUF5QixJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNsSSxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsc0VBQXNFLEVBQUU7b0JBQzVFLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsaUNBQXlCLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ25JLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyw0REFBNEQsRUFBRTtvQkFDbEUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLHdCQUF3QiwrQkFBdUIsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDakksQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLHNFQUFzRSxFQUFFO29CQUM1RSxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsNEJBQW9CLENBQUMsd0JBQXdCLCtCQUF1QixLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqSSxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsOERBQThELEVBQUU7b0JBQ3BFLE9BQU8scUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSw0QkFBb0IsQ0FBQyx3QkFBd0IsK0JBQXVCLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2hJLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyx3RUFBd0UsRUFBRTtvQkFDOUUsT0FBTyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDRCQUFvQixDQUFDLHdCQUF3QiwrQkFBdUIsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDaEksQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUdILEtBQUssVUFBVSxXQUFXLENBQVksT0FBZSxFQUFFLGNBQThCLEVBQUUsZUFBd0IsRUFBRSxTQUFrQixFQUFFLFVBQW1CO2dCQUN2SixNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sYUFBYSxFQUFFLENBQUM7Z0JBRXBELE1BQU0sUUFBUSxHQUFHLGtCQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRWpGLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFM0Qsc0JBQXNCO2dCQUN0QixRQUFRLENBQUMseUJBQXlCLENBQUMsOEJBQThCLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUVuRyxrQ0FBa0M7Z0JBQ2xDLElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ2YsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSx5QkFBUyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztpQkFDM0U7Z0JBRUQsbUNBQW1DO2dCQUNuQyxJQUFJLGVBQWUsRUFBRTtvQkFDcEIsUUFBUSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM1RDtnQkFFRCwwREFBMEQ7Z0JBQzFELFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsOEJBQXNCLENBQUM7Z0JBRWxFLE1BQU0sS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUN2QixLQUFLLEVBQUUsZUFBZSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUU5RCxNQUFNLEtBQUssR0FBRyxJQUFJLCtDQUF1QixFQUFFLENBQUM7Z0JBQzVDLEtBQUssQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDO2dCQUM5QixRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRXBELE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFDL0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEtBQUssQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxxREFBcUQ7Z0JBQ3hHLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDJGQUEyRjtnQkFDN0ssTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBRXJDLE1BQU0sT0FBTyxFQUFFLENBQUM7WUFDakIsQ0FBQztZQUVELEtBQUssVUFBVSxxQkFBcUIsQ0FBWSxPQUFlLEVBQUUsY0FBOEIsRUFBRSxlQUF3QixFQUFFLFNBQWtCLEVBQUUsVUFBbUI7Z0JBQ2pLLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsTUFBTSxhQUFhLEVBQUUsQ0FBQztnQkFFcEQsTUFBTSxxQkFBc0IsU0FBUSx1Q0FBZTtvQkFFbEQsWUFBWSxRQUFhO3dCQUN4QixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBS1IsaUJBQVksR0FBRyxxRkFBcUUsQ0FBQzt3QkFIN0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDdkUsQ0FBQztvQkFJUSxPQUFPO3dCQUNmLE9BQU8sS0FBSyxDQUFDO29CQUNkLENBQUM7b0JBRVEsVUFBVTt3QkFDbEIsT0FBTyxJQUFJLENBQUM7b0JBQ2IsQ0FBQztpQkFDRDtnQkFFRCxzQkFBc0I7Z0JBQ3RCLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRW5HLGtDQUFrQztnQkFDbEMsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLHlCQUFTLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO2lCQUMzRTtnQkFFRCxtQ0FBbUM7Z0JBQ25DLElBQUksZUFBZSxFQUFFO29CQUNwQixRQUFRLENBQUMsaUJBQWlCLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzVEO2dCQUVELDBEQUEwRDtnQkFDMUQsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQiw4QkFBc0IsQ0FBQztnQkFFbEUsTUFBTSxRQUFRLEdBQUcsa0JBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQzNELFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUVyRCxNQUFNLEtBQUssR0FBRyxJQUFJLCtDQUF1QixFQUFFLENBQUM7Z0JBQzVDLEtBQUssQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDO2dCQUM5QixRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRXBELE1BQU0sSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFDL0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEtBQUssQ0FBQyxVQUFVLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxxREFBcUQ7Z0JBQ3hHLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLDJGQUEyRjtnQkFDN0ssTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBRXJDLE1BQU0sT0FBTyxFQUFFLENBQUM7WUFDakIsQ0FBQztRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFDIn0=