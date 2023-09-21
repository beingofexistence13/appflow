/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/files/common/files", "vs/workbench/services/workingCopy/common/resourceWorkingCopy", "vs/base/common/lifecycle", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, event_1, uri_1, workbenchTestServices_1, files_1, resourceWorkingCopy_1, lifecycle_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ResourceWorkingCopy', function () {
        class TestResourceWorkingCopy extends resourceWorkingCopy_1.$DD {
            constructor() {
                super(...arguments);
                this.name = 'testName';
                this.typeId = 'testTypeId';
                this.capabilities = 0 /* WorkingCopyCapabilities.None */;
                this.onDidChangeDirty = event_1.Event.None;
                this.onDidChangeContent = event_1.Event.None;
                this.onDidSave = event_1.Event.None;
            }
            isDirty() { return false; }
            async backup(token) { throw new Error('Method not implemented.'); }
            async save(options) { return false; }
            async revert(options) { }
        }
        const disposables = new lifecycle_1.$jc();
        const resource = uri_1.URI.file('test/resource');
        let instantiationService;
        let accessor;
        let workingCopy;
        function createWorkingCopy(uri = resource) {
            return new TestResourceWorkingCopy(uri, accessor.fileService);
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            workingCopy = disposables.add(createWorkingCopy());
        });
        teardown(() => {
            disposables.clear();
        });
        test('orphaned tracking', async () => {
            return (0, timeTravelScheduler_1.$kT)({}, async () => {
                assert.strictEqual(workingCopy.isOrphaned(), false);
                let onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await onDidChangeOrphanedPromise;
                assert.strictEqual(workingCopy.isOrphaned(), true);
                onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.delete(resource);
                accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 1 /* FileChangeType.ADDED */ }], false));
                await onDidChangeOrphanedPromise;
                assert.strictEqual(workingCopy.isOrphaned(), false);
            });
        });
        test('dispose, isDisposed', async () => {
            assert.strictEqual(workingCopy.isDisposed(), false);
            let disposedEvent = false;
            disposables.add(workingCopy.onWillDispose(() => {
                disposedEvent = true;
            }));
            workingCopy.dispose();
            assert.strictEqual(workingCopy.isDisposed(), true);
            assert.strictEqual(disposedEvent, true);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=resourceWorkingCopy.test.js.map