/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/stream", "vs/base/common/uri", "vs/base/test/common/utils", "vs/workbench/services/workingCopy/common/untitledFileWorkingCopy", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, buffer_1, cancellation_1, event_1, lifecycle_1, network_1, resources_1, stream_1, uri_1, utils_1, untitledFileWorkingCopy_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rgc = exports.$qgc = void 0;
    class $qgc extends lifecycle_1.$kc {
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
            this.a.fire({ isInitial: newContents.length === 0 });
        }
        pushStackElement() {
            this.pushedStackElement = true;
        }
        dispose() {
            this.b.fire();
            super.dispose();
        }
    }
    exports.$qgc = $qgc;
    class $rgc {
        async createModel(resource, contents, token) {
            return new $qgc(resource, (await (0, buffer_1.$Rd)(contents)).toString());
        }
    }
    exports.$rgc = $rgc;
    suite('UntitledFileWorkingCopy', () => {
        const factory = new $rgc();
        const disposables = new lifecycle_1.$jc();
        const resource = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
        let instantiationService;
        let accessor;
        let workingCopy;
        function createWorkingCopy(uri = resource, hasAssociatedFilePath = false, initialValue = '') {
            return disposables.add(new untitledFileWorkingCopy_1.$9rb('testUntitledWorkingCopyType', uri, (0, resources_1.$fg)(uri), hasAssociatedFilePath, false, initialValue.length > 0 ? { value: (0, buffer_1.$Td)(buffer_1.$Fd.fromString(initialValue)) } : undefined, factory, async (workingCopy) => { await workingCopy.revert(); return true; }, accessor.workingCopyService, accessor.workingCopyBackupService, accessor.logService));
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            workingCopy = disposables.add(createWorkingCopy());
        });
        teardown(() => {
            disposables.clear();
        });
        test('registers with working copy service', async () => {
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 1);
            workingCopy.dispose();
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
        });
        test('dirty', async () => {
            assert.strictEqual(workingCopy.isDirty(), false);
            let changeDirtyCounter = 0;
            disposables.add(workingCopy.onDidChangeDirty(() => {
                changeDirtyCounter++;
            }));
            let contentChangeCounter = 0;
            disposables.add(workingCopy.onDidChangeContent(() => {
                contentChangeCounter++;
            }));
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isResolved(), true);
            // Dirty from: Model content change
            workingCopy.model?.updateContents('hello dirty');
            assert.strictEqual(contentChangeCounter, 1);
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(changeDirtyCounter, 1);
            await workingCopy.save();
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(changeDirtyCounter, 2);
        });
        test('dirty - cleared when content event signals isEmpty', async () => {
            assert.strictEqual(workingCopy.isDirty(), false);
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello dirty');
            assert.strictEqual(workingCopy.isDirty(), true);
            workingCopy.model?.fireContentChangeEvent({ isInitial: true });
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('dirty - not cleared when content event signals isEmpty when associated resource', async () => {
            workingCopy.dispose();
            workingCopy = createWorkingCopy(resource, true);
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello dirty');
            assert.strictEqual(workingCopy.isDirty(), true);
            workingCopy.model?.fireContentChangeEvent({ isInitial: true });
            assert.strictEqual(workingCopy.isDirty(), true);
        });
        test('revert', async () => {
            let revertCounter = 0;
            disposables.add(workingCopy.onDidRevert(() => {
                revertCounter++;
            }));
            let disposeCounter = 0;
            disposables.add(workingCopy.onWillDispose(() => {
                disposeCounter++;
            }));
            await workingCopy.resolve();
            workingCopy.model?.updateContents('hello dirty');
            assert.strictEqual(workingCopy.isDirty(), true);
            await workingCopy.revert();
            assert.strictEqual(revertCounter, 1);
            assert.strictEqual(disposeCounter, 1);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('dispose', async () => {
            let disposeCounter = 0;
            disposables.add(workingCopy.onWillDispose(() => {
                disposeCounter++;
            }));
            await workingCopy.resolve();
            workingCopy.dispose();
            assert.strictEqual(disposeCounter, 1);
        });
        test('backup', async () => {
            assert.strictEqual((await workingCopy.backup(cancellation_1.CancellationToken.None)).content, undefined);
            await workingCopy.resolve();
            workingCopy.model?.updateContents('Hello Backup');
            const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
            let backupContents = undefined;
            if ((0, stream_1.$rd)(backup.content)) {
                backupContents = (await (0, stream_1.$wd)(backup.content, chunks => buffer_1.$Fd.concat(chunks))).toString();
            }
            else if (backup.content) {
                backupContents = (0, stream_1.$ud)(backup.content, chunks => buffer_1.$Fd.concat(chunks)).toString();
            }
            assert.strictEqual(backupContents, 'Hello Backup');
        });
        test('resolve - without contents', async () => {
            assert.strictEqual(workingCopy.isResolved(), false);
            assert.strictEqual(workingCopy.hasAssociatedFilePath, false);
            assert.strictEqual(workingCopy.model, undefined);
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isResolved(), true);
            assert.ok(workingCopy.model);
        });
        test('resolve - with initial contents', async () => {
            workingCopy.dispose();
            workingCopy = createWorkingCopy(resource, false, 'Hello Initial');
            let contentChangeCounter = 0;
            disposables.add(workingCopy.onDidChangeContent(() => {
                contentChangeCounter++;
            }));
            assert.strictEqual(workingCopy.isDirty(), true);
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.model?.contents, 'Hello Initial');
            assert.strictEqual(contentChangeCounter, 1);
            workingCopy.model.updateContents('Changed contents');
            await workingCopy.resolve(); // second resolve should be ignored
            assert.strictEqual(workingCopy.model?.contents, 'Changed contents');
        });
        test('backup - with initial contents uses those even if unresolved', async () => {
            workingCopy.dispose();
            workingCopy = createWorkingCopy(resource, false, 'Hello Initial');
            assert.strictEqual(workingCopy.isDirty(), true);
            const backup = (await workingCopy.backup(cancellation_1.CancellationToken.None)).content;
            if ((0, stream_1.$rd)(backup)) {
                const value = await (0, buffer_1.$Rd)(backup);
                assert.strictEqual(value.toString(), 'Hello Initial');
            }
            else if ((0, stream_1.$qd)(backup)) {
                const value = (0, buffer_1.$Pd)(backup);
                assert.strictEqual(value.toString(), 'Hello Initial');
            }
            else {
                assert.fail('Missing untitled backup');
            }
        });
        test('resolve - with associated resource', async () => {
            workingCopy.dispose();
            workingCopy = createWorkingCopy(resource, true);
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasAssociatedFilePath, true);
        });
        test('resolve - with backup', async () => {
            await workingCopy.resolve();
            workingCopy.model?.updateContents('Hello Backup');
            const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
            await accessor.workingCopyBackupService.backup(workingCopy, backup.content, undefined, backup.meta);
            assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
            workingCopy.dispose();
            workingCopy = createWorkingCopy();
            let contentChangeCounter = 0;
            disposables.add(workingCopy.onDidChangeContent(() => {
                contentChangeCounter++;
            }));
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.model?.contents, 'Hello Backup');
            assert.strictEqual(contentChangeCounter, 1);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=untitledFileWorkingCopy.test.js.map