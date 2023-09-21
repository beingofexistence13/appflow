/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/services/workingCopy/common/storedFileWorkingCopy", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/resources", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/base/common/async", "vs/base/common/stream", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, event_1, uri_1, storedFileWorkingCopy_1, buffer_1, cancellation_1, lifecycle_1, workbenchTestServices_1, resources_1, files_1, editor_1, async_1, stream_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pgc = exports.$ogc = exports.$ngc = exports.$mgc = void 0;
    class $mgc extends lifecycle_1.$kc {
        constructor(resource, contents) {
            super();
            this.resource = resource;
            this.contents = contents;
            this.a = this.B(new event_1.$fd());
            this.onDidChangeContent = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onWillDispose = this.b.event;
            this.c = false;
            this.versionId = 0;
            this.pushedStackElement = false;
        }
        fireContentChangeEvent(event) {
            this.a.fire(event);
        }
        updateContents(newContents) {
            this.f(newContents);
        }
        setThrowOnSnapshot() {
            this.c = true;
        }
        async snapshot(token) {
            if (this.c) {
                throw new Error('Fail');
            }
            const stream = (0, buffer_1.$Vd)();
            stream.end(buffer_1.$Fd.fromString(this.contents));
            return stream;
        }
        async update(contents, token) {
            this.f((await (0, buffer_1.$Rd)(contents)).toString());
        }
        f(newContents) {
            this.contents = newContents;
            this.versionId++;
            this.a.fire({ isRedoing: false, isUndoing: false });
        }
        pushStackElement() {
            this.pushedStackElement = true;
        }
        dispose() {
            this.b.fire();
            super.dispose();
        }
    }
    exports.$mgc = $mgc;
    class $ngc extends $mgc {
        constructor() {
            super(...arguments);
            this.saveCounter = 0;
            this.throwOnSave = false;
        }
        async save(options, token) {
            if (this.throwOnSave) {
                throw new Error('Fail');
            }
            this.saveCounter++;
            return {
                resource: this.resource,
                ctime: 0,
                etag: '',
                isDirectory: false,
                isFile: true,
                mtime: 0,
                name: 'resource2',
                size: 0,
                isSymbolicLink: false,
                readonly: false,
                locked: false,
                children: undefined
            };
        }
    }
    exports.$ngc = $ngc;
    class $ogc {
        async createModel(resource, contents, token) {
            return new $mgc(resource, (await (0, buffer_1.$Rd)(contents)).toString());
        }
    }
    exports.$ogc = $ogc;
    class $pgc {
        async createModel(resource, contents, token) {
            return new $ngc(resource, (await (0, buffer_1.$Rd)(contents)).toString());
        }
    }
    exports.$pgc = $pgc;
    suite('StoredFileWorkingCopy (with custom save)', function () {
        const factory = new $pgc();
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        let workingCopy;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            const resource = uri_1.URI.file('test/resource');
            workingCopy = disposables.add(new storedFileWorkingCopy_1.$FD('testStoredFileWorkingCopyType', resource, (0, resources_1.$fg)(resource), factory, options => workingCopy.resolve(options), accessor.fileService, accessor.logService, accessor.workingCopyFileService, accessor.filesConfigurationService, accessor.workingCopyBackupService, accessor.workingCopyService, accessor.notificationService, accessor.workingCopyEditorService, accessor.editorService, accessor.elevatedFileService));
        });
        teardown(() => {
            disposables.clear();
        });
        test('save (custom implemented)', async () => {
            let savedCounter = 0;
            let lastSaveEvent = undefined;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
                lastSaveEvent = e;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // unresolved
            await workingCopy.save();
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 0);
            // simple
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            await workingCopy.save();
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(lastSaveEvent.reason, 1 /* SaveReason.EXPLICIT */);
            assert.ok(lastSaveEvent.stat);
            assert.ok((0, storedFileWorkingCopy_1.$ED)(lastSaveEvent));
            assert.strictEqual(workingCopy.model?.pushedStackElement, true);
            assert.strictEqual(workingCopy.model.saveCounter, 1);
            // error
            workingCopy.model?.updateContents('hello save error');
            workingCopy.model.throwOnSave = true;
            await workingCopy.save();
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), true);
        });
        (0, utils_1.$bT)();
    });
    suite('StoredFileWorkingCopy', function () {
        const factory = new $ogc();
        const disposables = new lifecycle_1.$jc();
        const resource = uri_1.URI.file('test/resource');
        let instantiationService;
        let accessor;
        let workingCopy;
        function createWorkingCopy(uri = resource) {
            const workingCopy = new storedFileWorkingCopy_1.$FD('testStoredFileWorkingCopyType', uri, (0, resources_1.$fg)(uri), factory, options => workingCopy.resolve(options), accessor.fileService, accessor.logService, accessor.workingCopyFileService, accessor.filesConfigurationService, accessor.workingCopyBackupService, accessor.workingCopyService, accessor.notificationService, accessor.workingCopyEditorService, accessor.editorService, accessor.elevatedFileService);
            return workingCopy;
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            workingCopy = disposables.add(createWorkingCopy());
        });
        teardown(() => {
            workingCopy.dispose();
            for (const workingCopy of accessor.workingCopyService.workingCopies) {
                workingCopy.dispose();
            }
            disposables.clear();
        });
        test('registers with working copy service', async () => {
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 1);
            workingCopy.dispose();
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
        });
        test('orphaned tracking', async () => {
            return (0, timeTravelScheduler_1.$kT)({}, async () => {
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), false);
                let onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await onDidChangeOrphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.delete(resource);
                accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 1 /* FileChangeType.ADDED */ }], false));
                await onDidChangeOrphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), false);
            });
        });
        test('dirty / modified', async () => {
            assert.strictEqual(workingCopy.isModified(), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isResolved(), true);
            let changeDirtyCounter = 0;
            disposables.add(workingCopy.onDidChangeDirty(() => {
                changeDirtyCounter++;
            }));
            let contentChangeCounter = 0;
            disposables.add(workingCopy.onDidChangeContent(() => {
                contentChangeCounter++;
            }));
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(() => {
                savedCounter++;
            }));
            // Dirty from: Model content change
            workingCopy.model?.updateContents('hello dirty');
            assert.strictEqual(contentChangeCounter, 1);
            assert.strictEqual(workingCopy.isModified(), true);
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            assert.strictEqual(changeDirtyCounter, 1);
            await workingCopy.save();
            assert.strictEqual(workingCopy.isModified(), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(changeDirtyCounter, 2);
            assert.strictEqual(savedCounter, 1);
            // Dirty from: Initial contents
            await workingCopy.resolve({ contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('hello dirty stream')) });
            assert.strictEqual(contentChangeCounter, 2); // content of model did not change
            assert.strictEqual(workingCopy.isModified(), true);
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            assert.strictEqual(changeDirtyCounter, 3);
            await workingCopy.revert({ soft: true });
            assert.strictEqual(workingCopy.isModified(), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(changeDirtyCounter, 4);
            // Modified from: API
            workingCopy.markModified();
            assert.strictEqual(workingCopy.isModified(), true);
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            assert.strictEqual(changeDirtyCounter, 5);
            await workingCopy.revert();
            assert.strictEqual(workingCopy.isModified(), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(changeDirtyCounter, 6);
        });
        test('dirty - working copy marks non-dirty when undo reaches saved version ID', async () => {
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello saved state');
            await workingCopy.save();
            assert.strictEqual(workingCopy.isDirty(), false);
            workingCopy.model?.updateContents('changing content once');
            assert.strictEqual(workingCopy.isDirty(), true);
            // Simulate an undo that goes back to the last (saved) version ID
            workingCopy.model.versionId--;
            workingCopy.model?.fireContentChangeEvent({ isRedoing: false, isUndoing: true });
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('resolve (without backup)', async () => {
            let onDidResolveCounter = 0;
            disposables.add(workingCopy.onDidResolve(() => {
                onDidResolveCounter++;
            }));
            // resolve from file
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isResolved(), true);
            assert.strictEqual(onDidResolveCounter, 1);
            assert.strictEqual(workingCopy.model?.contents, 'Hello Html');
            // dirty resolve returns early
            workingCopy.model?.updateContents('hello resolve');
            assert.strictEqual(workingCopy.isDirty(), true);
            await workingCopy.resolve();
            assert.strictEqual(onDidResolveCounter, 1);
            assert.strictEqual(workingCopy.model?.contents, 'hello resolve');
            // dirty resolve with contents updates contents
            await workingCopy.resolve({ contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('hello initial contents')) });
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.model?.contents, 'hello initial contents');
            assert.strictEqual(onDidResolveCounter, 2);
            // resolve with pending save returns directly
            const pendingSave = workingCopy.save();
            await workingCopy.resolve();
            await pendingSave;
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.model?.contents, 'hello initial contents');
            assert.strictEqual(onDidResolveCounter, 2);
            // disposed resolve is not throwing an error
            workingCopy.dispose();
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDisposed(), true);
            assert.strictEqual(onDidResolveCounter, 2);
        });
        test('resolve (with backup)', async () => {
            await workingCopy.resolve({ contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('hello backup')) });
            const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
            await accessor.workingCopyBackupService.backup(workingCopy, backup.content, undefined, backup.meta);
            assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
            workingCopy.dispose();
            // first resolve loads from backup
            workingCopy = createWorkingCopy();
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(workingCopy.model?.contents, 'hello backup');
            workingCopy.model.updateContents('hello updated');
            await workingCopy.save();
            // subsequent resolve ignores any backups
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.model?.contents, 'Hello Html');
        });
        test('resolve (with backup, preserves metadata and orphaned state)', async () => {
            return (0, timeTravelScheduler_1.$kT)({}, async () => {
                await workingCopy.resolve({ contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('hello backup')) });
                const orphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await orphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
                await accessor.workingCopyBackupService.backup(workingCopy, backup.content, undefined, backup.meta);
                assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
                workingCopy.dispose();
                workingCopy = createWorkingCopy();
                await workingCopy.resolve();
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                const backup2 = await workingCopy.backup(cancellation_1.CancellationToken.None);
                assert.deepStrictEqual(backup.meta, backup2.meta);
            });
        });
        test('resolve (updates orphaned state accordingly)', async () => {
            return (0, timeTravelScheduler_1.$kT)({}, async () => {
                await workingCopy.resolve();
                const orphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await orphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                // resolving clears orphaned state when successful
                accessor.fileService.notExistsSet.delete(resource);
                await workingCopy.resolve({ forceReadFromFile: true });
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), false);
                // resolving adds orphaned state when fail to read
                try {
                    accessor.fileService.readShouldThrowError = new files_1.$nk('file not found', 1 /* FileOperationResult.FILE_NOT_FOUND */);
                    await workingCopy.resolve();
                    assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                }
                finally {
                    accessor.fileService.readShouldThrowError = undefined;
                }
            });
        });
        test('resolve (FILE_NOT_MODIFIED_SINCE can be handled for resolved working copies)', async () => {
            await workingCopy.resolve();
            try {
                accessor.fileService.readShouldThrowError = new files_1.$nk('file not modified since', 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */);
                await workingCopy.resolve();
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(workingCopy.model?.contents, 'Hello Html');
        });
        test('resolve (FILE_NOT_MODIFIED_SINCE still updates readonly state)', async () => {
            let readonlyChangeCounter = 0;
            disposables.add(workingCopy.onDidChangeReadonly(() => readonlyChangeCounter++));
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isReadonly(), false);
            const stat = await accessor.fileService.resolve(workingCopy.resource, { resolveMetadata: true });
            try {
                accessor.fileService.readShouldThrowError = new files_1.$pk('file not modified since', { ...stat, readonly: true });
                await workingCopy.resolve();
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(!!workingCopy.isReadonly(), true);
            assert.strictEqual(readonlyChangeCounter, 1);
            try {
                accessor.fileService.readShouldThrowError = new files_1.$pk('file not modified since', { ...stat, readonly: false });
                await workingCopy.resolve();
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(readonlyChangeCounter, 2);
        });
        test('resolve does not alter content when model content changed in parallel', async () => {
            await workingCopy.resolve();
            const resolvePromise = workingCopy.resolve();
            workingCopy.model?.updateContents('changed content');
            await resolvePromise;
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.model?.contents, 'changed content');
        });
        test('backup', async () => {
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello backup');
            const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
            assert.ok(backup.meta);
            let backupContents = undefined;
            if (backup.content instanceof buffer_1.$Fd) {
                backupContents = backup.content.toString();
            }
            else if ((0, stream_1.$rd)(backup.content)) {
                backupContents = (await (0, stream_1.$wd)(backup.content, chunks => buffer_1.$Fd.concat(chunks))).toString();
            }
            else if (backup.content) {
                backupContents = (0, stream_1.$ud)(backup.content, chunks => buffer_1.$Fd.concat(chunks)).toString();
            }
            assert.strictEqual(backupContents, 'hello backup');
        });
        test('save (no errors) - simple', async () => {
            let savedCounter = 0;
            let lastSaveEvent = undefined;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
                lastSaveEvent = e;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // unresolved
            await workingCopy.save();
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 0);
            // simple
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            await workingCopy.save();
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(lastSaveEvent.reason, 1 /* SaveReason.EXPLICIT */);
            assert.ok(lastSaveEvent.stat);
            assert.ok((0, storedFileWorkingCopy_1.$ED)(lastSaveEvent));
            assert.strictEqual(workingCopy.model?.pushedStackElement, true);
        });
        test('save (no errors) - save reason', async () => {
            let savedCounter = 0;
            let lastSaveEvent = undefined;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
                lastSaveEvent = e;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // save reason
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            const source = editor_1.$SE.registerSource('testSource', 'Hello Save');
            await workingCopy.save({ reason: 2 /* SaveReason.AUTO */, source });
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(lastSaveEvent.reason, 2 /* SaveReason.AUTO */);
            assert.strictEqual(lastSaveEvent.source, source);
        });
        test('save (no errors) - multiple', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // multiple saves in parallel are fine and result
            // in a single save when content does not change
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            await async_1.Promises.settled([
                workingCopy.save({ reason: 2 /* SaveReason.AUTO */ }),
                workingCopy.save({ reason: 1 /* SaveReason.EXPLICIT */ }),
                workingCopy.save({ reason: 4 /* SaveReason.WINDOW_CHANGE */ })
            ]);
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (no errors) - multiple, cancellation', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // multiple saves in parallel are fine and result
            // in just one save operation (the second one
            // cancels the first)
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello save');
            const firstSave = workingCopy.save();
            workingCopy.model?.updateContents('hello save more');
            const secondSave = workingCopy.save();
            await async_1.Promises.settled([firstSave, secondSave]);
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (no errors) - not forced but not dirty', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // no save when not forced and not dirty
            await workingCopy.resolve();
            await workingCopy.save();
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (no errors) - forced but not dirty', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(e => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            // save when forced even when not dirty
            await workingCopy.resolve();
            await workingCopy.save({ force: true });
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (no errors) - save clears orphaned', async () => {
            return (0, timeTravelScheduler_1.$kT)({}, async () => {
                let savedCounter = 0;
                disposables.add(workingCopy.onDidSave(e => {
                    savedCounter++;
                }));
                let saveErrorCounter = 0;
                disposables.add(workingCopy.onDidSaveError(() => {
                    saveErrorCounter++;
                }));
                await workingCopy.resolve();
                // save clears orphaned
                const orphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await orphanedPromise;
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), true);
                await workingCopy.save({ force: true });
                assert.strictEqual(savedCounter, 1);
                assert.strictEqual(saveErrorCounter, 0);
                assert.strictEqual(workingCopy.isDirty(), false);
                assert.strictEqual(workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */), false);
            });
        });
        test('save (errors)', async () => {
            let savedCounter = 0;
            disposables.add(workingCopy.onDidSave(reason => {
                savedCounter++;
            }));
            let saveErrorCounter = 0;
            disposables.add(workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            }));
            await workingCopy.resolve();
            // save error: any error marks working copy dirty
            try {
                accessor.fileService.writeShouldThrowError = new files_1.$nk('write error', 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
                await workingCopy.save({ force: true });
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), true);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), true);
            // save is a no-op unless forced when in error case
            await workingCopy.save({ reason: 2 /* SaveReason.AUTO */ });
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), true);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), true);
            // save clears error flags when successful
            await workingCopy.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), false);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            // save error: conflict
            try {
                accessor.fileService.writeShouldThrowError = new files_1.$nk('write error conflict', 3 /* FileOperationResult.FILE_MODIFIED_SINCE */);
                await workingCopy.save({ force: true });
            }
            catch (error) {
                // error is expected
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 2);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), true);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), true);
            assert.strictEqual(workingCopy.isDirty(), true);
            // save clears error flags when successful
            await workingCopy.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            assert.strictEqual(savedCounter, 2);
            assert.strictEqual(saveErrorCounter, 2);
            assert.strictEqual(workingCopy.hasState(5 /* StoredFileWorkingCopyState.ERROR */), false);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('save (errors, bubbles up with `ignoreErrorHandler`)', async () => {
            await workingCopy.resolve();
            let error = undefined;
            try {
                accessor.fileService.writeShouldThrowError = new files_1.$nk('write error', 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
                await workingCopy.save({ force: true, ignoreErrorHandler: true });
            }
            catch (e) {
                error = e;
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            assert.ok(error);
        });
        test('save - returns false when save fails', async function () {
            await workingCopy.resolve();
            try {
                accessor.fileService.writeShouldThrowError = new files_1.$nk('write error', 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
                const res = await workingCopy.save({ force: true });
                assert.strictEqual(res, false);
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            const res = await workingCopy.save({ force: true });
            assert.strictEqual(res, true);
        });
        test('save participant', async () => {
            await workingCopy.resolve();
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
            let participationCounter = 0;
            const disposable = accessor.workingCopyFileService.addSaveParticipant({
                participate: async (wc) => {
                    if (workingCopy === wc) {
                        participationCounter++;
                    }
                }
            });
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, true);
            await workingCopy.save({ force: true });
            assert.strictEqual(participationCounter, 1);
            await workingCopy.save({ force: true, skipSaveParticipants: true });
            assert.strictEqual(participationCounter, 1);
            disposable.dispose();
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
            await workingCopy.save({ force: true });
            assert.strictEqual(participationCounter, 1);
        });
        test('Save Participant, calling save from within is unsupported but does not explode (sync save)', async function () {
            await workingCopy.resolve();
            await testSaveFromSaveParticipant(workingCopy, false);
        });
        test('Save Participant, calling save from within is unsupported but does not explode (async save)', async function () {
            await workingCopy.resolve();
            await testSaveFromSaveParticipant(workingCopy, true);
        });
        async function testSaveFromSaveParticipant(workingCopy, async) {
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, false);
            const disposable = accessor.workingCopyFileService.addSaveParticipant({
                participate: async () => {
                    if (async) {
                        await (0, async_1.$Hg)(10);
                    }
                    await workingCopy.save({ force: true });
                }
            });
            assert.strictEqual(accessor.workingCopyFileService.hasSaveParticipants, true);
            await workingCopy.save({ force: true });
            disposable.dispose();
        }
        test('revert', async () => {
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello revert');
            let revertedCounter = 0;
            disposables.add(workingCopy.onDidRevert(() => {
                revertedCounter++;
            }));
            // revert: soft
            await workingCopy.revert({ soft: true });
            assert.strictEqual(revertedCounter, 1);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.model?.contents, 'hello revert');
            // revert: not forced
            await workingCopy.revert();
            assert.strictEqual(revertedCounter, 1);
            assert.strictEqual(workingCopy.model?.contents, 'hello revert');
            // revert: forced
            await workingCopy.revert({ force: true });
            assert.strictEqual(revertedCounter, 2);
            assert.strictEqual(workingCopy.model?.contents, 'Hello Html');
            // revert: forced, error
            try {
                workingCopy.model?.updateContents('hello revert');
                accessor.fileService.readShouldThrowError = new files_1.$nk('error', 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
                await workingCopy.revert({ force: true });
            }
            catch (error) {
                // expected (our error)
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(revertedCounter, 2);
            assert.strictEqual(workingCopy.isDirty(), true);
            // revert: forced, file not found error is ignored
            try {
                workingCopy.model?.updateContents('hello revert');
                accessor.fileService.readShouldThrowError = new files_1.$nk('error', 1 /* FileOperationResult.FILE_NOT_FOUND */);
                await workingCopy.revert({ force: true });
            }
            catch (error) {
                // expected (our error)
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(revertedCounter, 3);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('state', async () => {
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            await workingCopy.resolve({ contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('hello state')) });
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            const savePromise = workingCopy.save();
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), true);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), true);
            await savePromise;
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
        });
        test('joinState', async () => {
            await workingCopy.resolve({ contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('hello state')) });
            workingCopy.save();
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), true);
            await workingCopy.joinState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */);
            assert.strictEqual(workingCopy.hasState(1 /* StoredFileWorkingCopyState.DIRTY */), false);
            assert.strictEqual(workingCopy.hasState(0 /* StoredFileWorkingCopyState.SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* StoredFileWorkingCopyState.PENDING_SAVE */), false);
        });
        test('isReadonly, isResolved, dispose, isDisposed', async () => {
            assert.strictEqual(workingCopy.isResolved(), false);
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(workingCopy.isDisposed(), false);
            await workingCopy.resolve();
            assert.ok(workingCopy.model);
            assert.strictEqual(workingCopy.isResolved(), true);
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(workingCopy.isDisposed(), false);
            let disposedEvent = false;
            disposables.add(workingCopy.onWillDispose(() => {
                disposedEvent = true;
            }));
            let disposedModelEvent = false;
            disposables.add(workingCopy.model.onWillDispose(() => {
                disposedModelEvent = true;
            }));
            workingCopy.dispose();
            assert.strictEqual(workingCopy.isDisposed(), true);
            assert.strictEqual(disposedEvent, true);
            assert.strictEqual(disposedModelEvent, true);
        });
        test('readonly change event', async () => {
            accessor.fileService.readonly = true;
            await workingCopy.resolve();
            assert.strictEqual(!!workingCopy.isReadonly(), true);
            accessor.fileService.readonly = false;
            let readonlyEvent = false;
            disposables.add(workingCopy.onDidChangeReadonly(() => {
                readonlyEvent = true;
            }));
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(readonlyEvent, true);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=storedFileWorkingCopy.test.js.map