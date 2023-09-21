/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/extpath", "vs/base/common/path", "vs/base/common/uri", "vs/workbench/services/workingCopy/common/workingCopyHistoryTracker", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/async", "vs/base/common/network", "vs/base/common/resources", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/notification/test/common/testNotificationService", "vs/base/common/cancellation", "vs/base/common/types", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/services/workingCopy/test/electron-sandbox/workingCopyHistoryService.test"], function (require, exports, assert, event_1, workbenchTestServices_1, extpath_1, path_1, uri_1, workingCopyHistoryTracker_1, workingCopyService_1, uriIdentityService_1, workbenchTestServices_2, async_1, network_1, resources_1, undoRedoService_1, testDialogService_1, testNotificationService_1, cancellation_1, types_1, buffer_1, lifecycle_1, utils_1, workingCopyHistoryService_test_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WorkingCopyHistoryTracker', () => {
        let testDir;
        let historyHome;
        let workHome;
        let workingCopyHistoryService;
        let workingCopyService;
        let fileService;
        let configurationService;
        let tracker;
        let testFile1Path;
        let testFile2Path;
        const disposables = new lifecycle_1.$jc();
        const testFile1PathContents = 'Hello Foo';
        const testFile2PathContents = [
            'Lorem ipsum ',
            'dolor öäü sit amet ',
            'adipiscing ßß elit',
            'consectetur '
        ].join('').repeat(1000);
        let increasingTimestampCounter = 1;
        async function addEntry(descriptor, token) {
            const entry = await workingCopyHistoryService.addEntry({
                ...descriptor,
                timestamp: increasingTimestampCounter++ // very important to get tests to not be flaky with stable sort order
            }, token);
            return (0, types_1.$uf)(entry);
        }
        setup(async () => {
            testDir = uri_1.URI.file((0, extpath_1.$Qf)((0, path_1.$9d)('vsctests', 'workingcopyhistorytracker'))).with({ scheme: network_1.Schemas.inMemory });
            historyHome = (0, resources_1.$ig)(testDir, 'User', 'History');
            workHome = (0, resources_1.$ig)(testDir, 'work');
            workingCopyHistoryService = disposables.add(new workingCopyHistoryService_test_1.$vgc(disposables));
            workingCopyService = disposables.add(new workingCopyService_1.$UC());
            fileService = workingCopyHistoryService._fileService;
            configurationService = workingCopyHistoryService._configurationService;
            tracker = disposables.add(createTracker());
            await fileService.createFolder(historyHome);
            await fileService.createFolder(workHome);
            testFile1Path = (0, resources_1.$ig)(workHome, 'foo.txt');
            testFile2Path = (0, resources_1.$ig)(workHome, 'bar.txt');
            await fileService.writeFile(testFile1Path, buffer_1.$Fd.fromString(testFile1PathContents));
            await fileService.writeFile(testFile2Path, buffer_1.$Fd.fromString(testFile2PathContents));
        });
        function createTracker() {
            return new workingCopyHistoryTracker_1.$p4b(workingCopyService, workingCopyHistoryService, disposables.add(new uriIdentityService_1.$pr(disposables.add(new workbenchTestServices_2.$Fec()))), new workbenchTestServices_2.$5ec(undefined, network_1.Schemas.file), configurationService, new undoRedoService_1.$myb(new testDialogService_1.$H0b(), new testNotificationService_1.$I0b()), new workbenchTestServices_1.$6dc(), workingCopyHistoryService._fileService);
        }
        teardown(async () => {
            await fileService.del(testDir, { recursive: true });
            disposables.clear();
        });
        test('history entry added on save', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const workingCopy2 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path));
            const stat1 = await fileService.resolve(workingCopy1.resource, { resolveMetadata: true });
            const stat2 = await fileService.resolve(workingCopy2.resource, { resolveMetadata: true });
            disposables.add(workingCopyService.registerWorkingCopy(workingCopy1));
            disposables.add(workingCopyService.registerWorkingCopy(workingCopy2));
            const saveResult = new async_1.$2g();
            let addedCounter = 0;
            disposables.add(workingCopyHistoryService.onDidAddEntry(e => {
                if ((0, resources_1.$bg)(e.entry.workingCopy.resource, workingCopy1.resource) || (0, resources_1.$bg)(e.entry.workingCopy.resource, workingCopy2.resource)) {
                    addedCounter++;
                    if (addedCounter === 2) {
                        saveResult.complete();
                    }
                }
            }));
            await workingCopy1.save(undefined, stat1);
            await workingCopy2.save(undefined, stat2);
            await saveResult.p;
        });
        test('history entry skipped when setting disabled (globally)', async () => {
            configurationService.setUserConfiguration('workbench.localHistory.enabled', false, testFile1Path);
            return assertNoLocalHistoryEntryAddedWithSettingsConfigured();
        });
        test('history entry skipped when setting disabled (exclude)', () => {
            configurationService.setUserConfiguration('workbench.localHistory.exclude', { '**/foo.txt': true });
            // Recreate to apply settings
            tracker.dispose();
            tracker = disposables.add(createTracker());
            return assertNoLocalHistoryEntryAddedWithSettingsConfigured();
        });
        test('history entry skipped when too large', async () => {
            configurationService.setUserConfiguration('workbench.localHistory.maxFileSize', 0, testFile1Path);
            return assertNoLocalHistoryEntryAddedWithSettingsConfigured();
        });
        async function assertNoLocalHistoryEntryAddedWithSettingsConfigured() {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const workingCopy2 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path));
            const stat1 = await fileService.resolve(workingCopy1.resource, { resolveMetadata: true });
            const stat2 = await fileService.resolve(workingCopy2.resource, { resolveMetadata: true });
            disposables.add(workingCopyService.registerWorkingCopy(workingCopy1));
            disposables.add(workingCopyService.registerWorkingCopy(workingCopy2));
            const saveResult = new async_1.$2g();
            disposables.add(workingCopyHistoryService.onDidAddEntry(e => {
                if ((0, resources_1.$bg)(e.entry.workingCopy.resource, workingCopy1.resource)) {
                    assert.fail('Unexpected working copy history entry: ' + e.entry.workingCopy.resource.toString());
                }
                if ((0, resources_1.$bg)(e.entry.workingCopy.resource, workingCopy2.resource)) {
                    saveResult.complete();
                }
            }));
            await workingCopy1.save(undefined, stat1);
            await workingCopy2.save(undefined, stat2);
            await saveResult.p;
        }
        test('entries moved (file rename)', async () => {
            const entriesMoved = event_1.Event.toPromise(workingCopyHistoryService.onDidMoveEntries);
            const workingCopy = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const entry1 = await addEntry({ resource: workingCopy.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry2 = await addEntry({ resource: workingCopy.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry3 = await addEntry({ resource: workingCopy.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            let entries = await workingCopyHistoryService.getEntries(workingCopy.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            const renamedWorkingCopyResource = (0, resources_1.$ig)((0, resources_1.$hg)(workingCopy.resource), 'renamed.txt');
            await workingCopyHistoryService._fileService.move(workingCopy.resource, renamedWorkingCopyResource);
            await entriesMoved;
            entries = await workingCopyHistoryService.getEntries(workingCopy.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            entries = await workingCopyHistoryService.getEntries(renamedWorkingCopyResource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 4);
            assert.strictEqual(entries[0].id, entry1.id);
            assert.strictEqual(entries[0].timestamp, entry1.timestamp);
            assert.strictEqual(entries[0].source, entry1.source);
            assert.notStrictEqual(entries[0].location, entry1.location);
            assert.strictEqual(entries[0].workingCopy.resource.toString(), renamedWorkingCopyResource.toString());
            assert.strictEqual(entries[1].id, entry2.id);
            assert.strictEqual(entries[1].timestamp, entry2.timestamp);
            assert.strictEqual(entries[1].source, entry2.source);
            assert.notStrictEqual(entries[1].location, entry2.location);
            assert.strictEqual(entries[1].workingCopy.resource.toString(), renamedWorkingCopyResource.toString());
            assert.strictEqual(entries[2].id, entry3.id);
            assert.strictEqual(entries[2].timestamp, entry3.timestamp);
            assert.strictEqual(entries[2].source, entry3.source);
            assert.notStrictEqual(entries[2].location, entry3.location);
            assert.strictEqual(entries[2].workingCopy.resource.toString(), renamedWorkingCopyResource.toString());
            const all = await workingCopyHistoryService.getAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(all.length, 1);
            assert.strictEqual(all[0].toString(), renamedWorkingCopyResource.toString());
        });
        test('entries moved (folder rename)', async () => {
            const entriesMoved = event_1.Event.toPromise(workingCopyHistoryService.onDidMoveEntries);
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const workingCopy2 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path));
            const entry1A = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry2A = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry3A = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry1B = await addEntry({ resource: workingCopy2.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry2B = await addEntry({ resource: workingCopy2.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry3B = await addEntry({ resource: workingCopy2.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            let entries = await workingCopyHistoryService.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            entries = await workingCopyHistoryService.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            const renamedWorkHome = (0, resources_1.$ig)((0, resources_1.$hg)(testDir), 'renamed');
            await workingCopyHistoryService._fileService.move(workHome, renamedWorkHome);
            const renamedWorkingCopy1Resource = (0, resources_1.$ig)(renamedWorkHome, (0, resources_1.$fg)(workingCopy1.resource));
            const renamedWorkingCopy2Resource = (0, resources_1.$ig)(renamedWorkHome, (0, resources_1.$fg)(workingCopy2.resource));
            await entriesMoved;
            entries = await workingCopyHistoryService.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            entries = await workingCopyHistoryService.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            entries = await workingCopyHistoryService.getEntries(renamedWorkingCopy1Resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 4);
            assert.strictEqual(entries[0].id, entry1A.id);
            assert.strictEqual(entries[0].timestamp, entry1A.timestamp);
            assert.strictEqual(entries[0].source, entry1A.source);
            assert.notStrictEqual(entries[0].location, entry1A.location);
            assert.strictEqual(entries[0].workingCopy.resource.toString(), renamedWorkingCopy1Resource.toString());
            assert.strictEqual(entries[1].id, entry2A.id);
            assert.strictEqual(entries[1].timestamp, entry2A.timestamp);
            assert.strictEqual(entries[1].source, entry2A.source);
            assert.notStrictEqual(entries[1].location, entry2A.location);
            assert.strictEqual(entries[1].workingCopy.resource.toString(), renamedWorkingCopy1Resource.toString());
            assert.strictEqual(entries[2].id, entry3A.id);
            assert.strictEqual(entries[2].timestamp, entry3A.timestamp);
            assert.strictEqual(entries[2].source, entry3A.source);
            assert.notStrictEqual(entries[2].location, entry3A.location);
            assert.strictEqual(entries[2].workingCopy.resource.toString(), renamedWorkingCopy1Resource.toString());
            entries = await workingCopyHistoryService.getEntries(renamedWorkingCopy2Resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 4);
            assert.strictEqual(entries[0].id, entry1B.id);
            assert.strictEqual(entries[0].timestamp, entry1B.timestamp);
            assert.strictEqual(entries[0].source, entry1B.source);
            assert.notStrictEqual(entries[0].location, entry1B.location);
            assert.strictEqual(entries[0].workingCopy.resource.toString(), renamedWorkingCopy2Resource.toString());
            assert.strictEqual(entries[1].id, entry2B.id);
            assert.strictEqual(entries[1].timestamp, entry2B.timestamp);
            assert.strictEqual(entries[1].source, entry2B.source);
            assert.notStrictEqual(entries[1].location, entry2B.location);
            assert.strictEqual(entries[1].workingCopy.resource.toString(), renamedWorkingCopy2Resource.toString());
            assert.strictEqual(entries[2].id, entry3B.id);
            assert.strictEqual(entries[2].timestamp, entry3B.timestamp);
            assert.strictEqual(entries[2].source, entry3B.source);
            assert.notStrictEqual(entries[2].location, entry3B.location);
            assert.strictEqual(entries[2].workingCopy.resource.toString(), renamedWorkingCopy2Resource.toString());
            const all = await workingCopyHistoryService.getAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(all.length, 2);
            for (const resource of all) {
                if (resource.toString() !== renamedWorkingCopy1Resource.toString() && resource.toString() !== renamedWorkingCopy2Resource.toString()) {
                    assert.fail(`Unexpected history resource: ${resource.toString()}`);
                }
            }
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=workingCopyHistoryTracker.test.js.map