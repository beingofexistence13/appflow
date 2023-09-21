/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/files/common/files", "vs/workbench/services/workingCopy/common/resourceWorkingCopy", "vs/base/common/lifecycle", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils"], function (require, exports, assert, event_1, uri_1, workbenchTestServices_1, files_1, resourceWorkingCopy_1, lifecycle_1, timeTravelScheduler_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ResourceWorkingCopy', function () {
        class TestResourceWorkingCopy extends resourceWorkingCopy_1.ResourceWorkingCopy {
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
        const disposables = new lifecycle_1.DisposableStore();
        const resource = uri_1.URI.file('test/resource');
        let instantiationService;
        let accessor;
        let workingCopy;
        function createWorkingCopy(uri = resource) {
            return new TestResourceWorkingCopy(uri, accessor.fileService);
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            workingCopy = disposables.add(createWorkingCopy());
        });
        teardown(() => {
            disposables.clear();
        });
        test('orphaned tracking', async () => {
            return (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                assert.strictEqual(workingCopy.isOrphaned(), false);
                let onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.set(resource, true);
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 2 /* FileChangeType.DELETED */ }], false));
                await onDidChangeOrphanedPromise;
                assert.strictEqual(workingCopy.isOrphaned(), true);
                onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
                accessor.fileService.notExistsSet.delete(resource);
                accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 1 /* FileChangeType.ADDED */ }], false));
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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VXb3JraW5nQ29weS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L3Rlc3QvYnJvd3Nlci9yZXNvdXJjZVdvcmtpbmdDb3B5LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFnQmhHLEtBQUssQ0FBQyxxQkFBcUIsRUFBRTtRQUU1QixNQUFNLHVCQUF3QixTQUFRLHlDQUFtQjtZQUF6RDs7Z0JBQ0MsU0FBSSxHQUFHLFVBQVUsQ0FBQztnQkFDbEIsV0FBTSxHQUFHLFlBQVksQ0FBQztnQkFDdEIsaUJBQVksd0NBQWdDO2dCQUM1QyxxQkFBZ0IsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO2dCQUM5Qix1QkFBa0IsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNoQyxjQUFTLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQU14QixDQUFDO1lBTEEsT0FBTyxLQUFjLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNwQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQXdCLElBQWlDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkgsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFzQixJQUFzQixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdEUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUF3QixJQUFtQixDQUFDO1NBRXpEO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMzQyxJQUFJLG9CQUEyQyxDQUFDO1FBQ2hELElBQUksUUFBNkIsQ0FBQztRQUNsQyxJQUFJLFdBQW9DLENBQUM7UUFFekMsU0FB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