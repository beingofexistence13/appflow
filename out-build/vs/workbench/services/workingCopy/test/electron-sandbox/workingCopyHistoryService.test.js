/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/common/workbenchTestServices", "vs/platform/log/common/log", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/base/common/uri", "vs/base/common/cancellation", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/services/label/common/labelService", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyHistoryService", "vs/base/common/resources", "vs/base/common/arrays", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/uuid", "vs/base/common/path", "vs/base/common/buffer", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, workbenchTestServices_1, log_1, fileService_1, network_1, uri_1, cancellation_1, uriIdentityService_1, labelService_1, workbenchTestServices_2, testConfigurationService_1, workingCopyHistoryService_1, resources_1, arrays_1, inMemoryFilesystemProvider_1, uuid_1, path_1, buffer_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vgc = void 0;
    class $vgc extends workingCopyHistoryService_1.$s4b {
        constructor(disposables, fileService) {
            const environmentService = workbenchTestServices_2.$qec;
            const logService = new log_1.$fj();
            if (!fileService) {
                fileService = disposables.add(new fileService_1.$Dp(logService));
                disposables.add(fileService.registerProvider(network_1.Schemas.inMemory, disposables.add(new inMemoryFilesystemProvider_1.$rAb())));
                disposables.add(fileService.registerProvider(network_1.Schemas.vscodeUserData, disposables.add(new inMemoryFilesystemProvider_1.$rAb())));
            }
            const remoteAgentService = new workbenchTestServices_2.$bfc();
            const uriIdentityService = disposables.add(new uriIdentityService_1.$pr(fileService));
            const lifecycleService = disposables.add(new workbenchTestServices_2.$Kec());
            const labelService = disposables.add(new labelService_1.$Bzb(environmentService, new workbenchTestServices_1.$6dc(), new workbenchTestServices_2.$5ec(), new workbenchTestServices_2.$bfc(), disposables.add(new workbenchTestServices_1.$7dc()), lifecycleService));
            const configurationService = new testConfigurationService_1.$G0b();
            super(fileService, remoteAgentService, environmentService, uriIdentityService, labelService, lifecycleService, logService, configurationService);
            this._fileService = fileService;
            this._configurationService = configurationService;
            this._lifecycleService = lifecycleService;
        }
    }
    exports.$vgc = $vgc;
    suite('WorkingCopyHistoryService', () => {
        const disposables = new lifecycle_1.$jc();
        let testDir;
        let historyHome;
        let workHome;
        let service;
        let fileService;
        let testFile1Path;
        let testFile2Path;
        let testFile3Path;
        const testFile1PathContents = 'Hello Foo';
        const testFile2PathContents = [
            'Lorem ipsum ',
            'dolor öäü sit amet ',
            'adipiscing ßß elit',
            'consectetur '
        ].join('');
        const testFile3PathContents = 'Hello Bar';
        setup(async () => {
            testDir = uri_1.URI.file((0, path_1.$9d)((0, uuid_1.$4f)(), 'vsctests', 'workingcopyhistoryservice')).with({ scheme: network_1.Schemas.inMemory });
            historyHome = (0, resources_1.$ig)(testDir, 'User', 'History');
            workHome = (0, resources_1.$ig)(testDir, 'work');
            service = disposables.add(new $vgc(disposables));
            fileService = service._fileService;
            await fileService.createFolder(historyHome);
            await fileService.createFolder(workHome);
            testFile1Path = (0, resources_1.$ig)(workHome, 'foo.txt');
            testFile2Path = (0, resources_1.$ig)(workHome, 'bar.txt');
            testFile3Path = (0, resources_1.$ig)(workHome, 'foo-bar.txt');
            await fileService.writeFile(testFile1Path, buffer_1.$Fd.fromString(testFile1PathContents));
            await fileService.writeFile(testFile2Path, buffer_1.$Fd.fromString(testFile2PathContents));
            await fileService.writeFile(testFile3Path, buffer_1.$Fd.fromString(testFile3PathContents));
        });
        let increasingTimestampCounter = 1;
        async function addEntry(descriptor, token, expectEntryAdded = true) {
            const entry = await service.addEntry({
                ...descriptor,
                timestamp: increasingTimestampCounter++ // very important to get tests to not be flaky with stable sort order
            }, token);
            if (expectEntryAdded) {
                assert.ok(entry, 'Unexpected undefined local history entry');
                assert.strictEqual((await fileService.exists(entry.location)), true, 'Unexpected local history not stored');
            }
            return entry;
        }
        teardown(() => {
            disposables.clear();
        });
        test('addEntry', async () => {
            const addEvents = [];
            disposables.add(service.onDidAddEntry(e => addEvents.push(e)));
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const workingCopy2 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path));
            // Add Entry works
            const entry1A = await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            const entry2A = await addEntry({ resource: workingCopy2.resource, source: 'My Source' }, cancellation_1.CancellationToken.None);
            assert.strictEqual((await fileService.readFile(entry1A.location)).value.toString(), testFile1PathContents);
            assert.strictEqual((await fileService.readFile(entry2A.location)).value.toString(), testFile2PathContents);
            assert.strictEqual(addEvents.length, 2);
            assert.strictEqual(addEvents[0].entry.workingCopy.resource.toString(), workingCopy1.resource.toString());
            assert.strictEqual(addEvents[1].entry.workingCopy.resource.toString(), workingCopy2.resource.toString());
            assert.strictEqual(addEvents[1].entry.source, 'My Source');
            const entry1B = await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            const entry2B = await addEntry({ resource: workingCopy2.resource }, cancellation_1.CancellationToken.None);
            assert.strictEqual((await fileService.readFile(entry1B.location)).value.toString(), testFile1PathContents);
            assert.strictEqual((await fileService.readFile(entry2B.location)).value.toString(), testFile2PathContents);
            assert.strictEqual(addEvents.length, 4);
            assert.strictEqual(addEvents[2].entry.workingCopy.resource.toString(), workingCopy1.resource.toString());
            assert.strictEqual(addEvents[3].entry.workingCopy.resource.toString(), workingCopy2.resource.toString());
            // Cancellation works
            const cts = new cancellation_1.$pd();
            const entry1CPromise = addEntry({ resource: workingCopy1.resource }, cts.token, false);
            cts.dispose(true);
            const entry1C = await entry1CPromise;
            assert.ok(!entry1C);
            assert.strictEqual(addEvents.length, 4);
            // Invalid working copies are ignored
            const workingCopy3 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path.with({ scheme: 'unsupported' })));
            const entry3A = await addEntry({ resource: workingCopy3.resource }, cancellation_1.CancellationToken.None, false);
            assert.ok(!entry3A);
            assert.strictEqual(addEvents.length, 4);
        });
        test('renameEntry', async () => {
            const changeEvents = [];
            disposables.add(service.onDidChangeEntry(e => changeEvents.push(e)));
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const entry = await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy1.resource, source: 'My Source' }, cancellation_1.CancellationToken.None);
            let entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            await service.updateEntry(entry, { source: 'Hello Rename' }, cancellation_1.CancellationToken.None);
            assert.strictEqual(changeEvents.length, 1);
            assert.strictEqual(changeEvents[0].entry, entry);
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries[0].source, 'Hello Rename');
            // Simulate shutdown
            const event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            assert.strictEqual(entries[0].source, 'Hello Rename');
        });
        test('removeEntry', async () => {
            const removeEvents = [];
            disposables.add(service.onDidRemoveEntry(e => removeEvents.push(e)));
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            const entry2 = await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy1.resource, source: 'My Source' }, cancellation_1.CancellationToken.None);
            let entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 4);
            let removed = await service.removeEntry(entry2, cancellation_1.CancellationToken.None);
            assert.strictEqual(removed, true);
            assert.strictEqual(removeEvents.length, 1);
            assert.strictEqual(removeEvents[0].entry, entry2);
            // Cannot remove same entry again
            removed = await service.removeEntry(entry2, cancellation_1.CancellationToken.None);
            assert.strictEqual(removed, false);
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            // Simulate shutdown
            const event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
        });
        test('removeEntry - deletes history entries folder when last entry removed', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            let entry = await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            // Simulate shutdown
            let event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            assert.strictEqual((await fileService.exists((0, resources_1.$hg)(entry.location))), true);
            entry = (0, arrays_1.$Mb)(await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None));
            assert.ok(entry);
            await service.removeEntry(entry, cancellation_1.CancellationToken.None);
            // Simulate shutdown
            event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            assert.strictEqual((await fileService.exists((0, resources_1.$hg)(entry.location))), false);
        });
        test('removeAll', async () => {
            let removed = false;
            disposables.add(service.onDidRemoveEntries(() => removed = true));
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const workingCopy2 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path));
            await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy2.resource }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy2.resource, source: 'My Source' }, cancellation_1.CancellationToken.None);
            let entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 2);
            entries = await service.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 2);
            await service.removeAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(removed, true);
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            entries = await service.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            // Simulate shutdown
            const event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            entries = await service.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
        });
        test('getEntries - simple', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const workingCopy2 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path));
            let entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            const entry1 = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 1);
            assertEntryEqual(entries[0], entry1);
            const entry2 = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 2);
            assertEntryEqual(entries[1], entry2);
            entries = await service.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            const entry3 = await addEntry({ resource: workingCopy2.resource, source: 'other-test-source' }, cancellation_1.CancellationToken.None);
            entries = await service.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 1);
            assertEntryEqual(entries[0], entry3);
        });
        test('getEntries - metadata preserved when stored', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const workingCopy2 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path));
            const entry1 = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry2 = await addEntry({ resource: workingCopy2.resource }, cancellation_1.CancellationToken.None);
            const entry3 = await addEntry({ resource: workingCopy2.resource, source: 'other-source' }, cancellation_1.CancellationToken.None);
            // Simulate shutdown
            const event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            let entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 1);
            assertEntryEqual(entries[0], entry1);
            entries = await service.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 2);
            assertEntryEqual(entries[0], entry2);
            assertEntryEqual(entries[1], entry3);
        });
        test('getEntries - corrupt meta.json is no problem', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const entry1 = await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            // Simulate shutdown
            const event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            const metaFile = (0, resources_1.$ig)((0, resources_1.$hg)(entry1.location), 'entries.json');
            assert.ok((await fileService.exists(metaFile)));
            await fileService.del(metaFile);
            const entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 1);
            assertEntryEqual(entries[0], entry1, false /* skip timestamp that is unreliable when entries.json is gone */);
        });
        test('getEntries - missing entries from meta.json is no problem', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const entry1 = await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            const entry2 = await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            // Simulate shutdown
            const event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            await fileService.del(entry1.location);
            const entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 1);
            assertEntryEqual(entries[0], entry2);
        });
        test('getEntries - in-memory and on-disk entries are merged', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const entry1 = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry2 = await addEntry({ resource: workingCopy1.resource, source: 'other-source' }, cancellation_1.CancellationToken.None);
            // Simulate shutdown
            const event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            const entry3 = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry4 = await addEntry({ resource: workingCopy1.resource, source: 'other-source' }, cancellation_1.CancellationToken.None);
            const entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 4);
            assertEntryEqual(entries[0], entry1);
            assertEntryEqual(entries[1], entry2);
            assertEntryEqual(entries[2], entry3);
            assertEntryEqual(entries[3], entry4);
        });
        test('getEntries - configured max entries respected', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            const entry3 = await addEntry({ resource: workingCopy1.resource, source: 'Test source' }, cancellation_1.CancellationToken.None);
            const entry4 = await addEntry({ resource: workingCopy1.resource }, cancellation_1.CancellationToken.None);
            service._configurationService.setUserConfiguration('workbench.localHistory.maxFileEntries', 2);
            let entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 2);
            assertEntryEqual(entries[0], entry3);
            assertEntryEqual(entries[1], entry4);
            service._configurationService.setUserConfiguration('workbench.localHistory.maxFileEntries', 4);
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 4);
            service._configurationService.setUserConfiguration('workbench.localHistory.maxFileEntries', 5);
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 4);
        });
        test('getAll', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const workingCopy2 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path));
            let resources = await service.getAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(resources.length, 0);
            await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy2.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy2.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            resources = await service.getAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(resources.length, 2);
            for (const resource of resources) {
                if (resource.toString() !== workingCopy1.resource.toString() && resource.toString() !== workingCopy2.resource.toString()) {
                    assert.fail(`Unexpected history resource: ${resource.toString()}`);
                }
            }
            // Simulate shutdown
            const event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            const workingCopy3 = disposables.add(new workbenchTestServices_1.$9dc(testFile3Path));
            await addEntry({ resource: workingCopy3.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            resources = await service.getAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(resources.length, 3);
            for (const resource of resources) {
                if (resource.toString() !== workingCopy1.resource.toString() && resource.toString() !== workingCopy2.resource.toString() && resource.toString() !== workingCopy3.resource.toString()) {
                    assert.fail(`Unexpected history resource: ${resource.toString()}`);
                }
            }
        });
        test('getAll - ignores resource when no entries exist', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const entry = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            let resources = await service.getAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(resources.length, 1);
            await service.removeEntry(entry, cancellation_1.CancellationToken.None);
            resources = await service.getAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(resources.length, 0);
            // Simulate shutdown
            const event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            resources = await service.getAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(resources.length, 0);
        });
        function assertEntryEqual(entryA, entryB, assertTimestamp = true) {
            assert.strictEqual(entryA.id, entryB.id);
            assert.strictEqual(entryA.location.toString(), entryB.location.toString());
            if (assertTimestamp) {
                assert.strictEqual(entryA.timestamp, entryB.timestamp);
            }
            assert.strictEqual(entryA.source, entryB.source);
            assert.strictEqual(entryA.workingCopy.name, entryB.workingCopy.name);
            assert.strictEqual(entryA.workingCopy.resource.toString(), entryB.workingCopy.resource.toString());
        }
        test('entries cleaned up on shutdown', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const entry1 = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry2 = await addEntry({ resource: workingCopy1.resource, source: 'other-source' }, cancellation_1.CancellationToken.None);
            const entry3 = await addEntry({ resource: workingCopy1.resource, source: 'other-source' }, cancellation_1.CancellationToken.None);
            const entry4 = await addEntry({ resource: workingCopy1.resource, source: 'other-source' }, cancellation_1.CancellationToken.None);
            service._configurationService.setUserConfiguration('workbench.localHistory.maxFileEntries', 2);
            // Simulate shutdown
            let event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            assert.ok(!(await fileService.exists(entry1.location)));
            assert.ok(!(await fileService.exists(entry2.location)));
            assert.ok((await fileService.exists(entry3.location)));
            assert.ok((await fileService.exists(entry4.location)));
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            let entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 2);
            assertEntryEqual(entries[0], entry3);
            assertEntryEqual(entries[1], entry4);
            service._configurationService.setUserConfiguration('workbench.localHistory.maxFileEntries', 3);
            const entry5 = await addEntry({ resource: workingCopy1.resource, source: 'other-source' }, cancellation_1.CancellationToken.None);
            // Simulate shutdown
            event = new workbenchTestServices_2.$Mec();
            service._lifecycleService.fireWillShutdown(event);
            await Promise.allSettled(event.value);
            assert.ok((await fileService.exists(entry3.location)));
            assert.ok((await fileService.exists(entry4.location)));
            assert.ok((await fileService.exists(entry5.location)));
            // Resolve from file service fresh and verify again
            service.dispose();
            service = disposables.add(new $vgc(disposables, fileService));
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            assertEntryEqual(entries[0], entry3);
            assertEntryEqual(entries[1], entry4);
            assertEntryEqual(entries[2], entry5);
        });
        test('entries are merged when source is same', async () => {
            let replaced = undefined;
            disposables.add(service.onDidReplaceEntry(e => replaced = e.entry));
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            service._configurationService.setUserConfiguration('workbench.localHistory.mergeWindow', 1);
            const entry1 = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            assert.strictEqual(replaced, undefined);
            const entry2 = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            assert.strictEqual(replaced, entry1);
            const entry3 = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            assert.strictEqual(replaced, entry2);
            let entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 1);
            assertEntryEqual(entries[0], entry3);
            service._configurationService.setUserConfiguration('workbench.localHistory.mergeWindow', undefined);
            await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
        });
        test('move entries (file rename)', async () => {
            const workingCopy = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const entry1 = await addEntry({ resource: workingCopy.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry2 = await addEntry({ resource: workingCopy.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry3 = await addEntry({ resource: workingCopy.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            let entries = await service.getEntries(workingCopy.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            const renamedWorkingCopyResource = (0, resources_1.$ig)((0, resources_1.$hg)(workingCopy.resource), 'renamed.txt');
            await fileService.move(workingCopy.resource, renamedWorkingCopyResource);
            const result = await service.moveEntries(workingCopy.resource, renamedWorkingCopyResource);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].toString(), renamedWorkingCopyResource.toString());
            entries = await service.getEntries(workingCopy.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            entries = await service.getEntries(renamedWorkingCopyResource, cancellation_1.CancellationToken.None);
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
            const all = await service.getAll(cancellation_1.CancellationToken.None);
            assert.strictEqual(all.length, 1);
            assert.strictEqual(all[0].toString(), renamedWorkingCopyResource.toString());
        });
        test('entries moved (folder rename)', async () => {
            const workingCopy1 = disposables.add(new workbenchTestServices_1.$9dc(testFile1Path));
            const workingCopy2 = disposables.add(new workbenchTestServices_1.$9dc(testFile2Path));
            const entry1A = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry2A = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry3A = await addEntry({ resource: workingCopy1.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry1B = await addEntry({ resource: workingCopy2.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry2B = await addEntry({ resource: workingCopy2.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            const entry3B = await addEntry({ resource: workingCopy2.resource, source: 'test-source' }, cancellation_1.CancellationToken.None);
            let entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            entries = await service.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 3);
            const renamedWorkHome = (0, resources_1.$ig)((0, resources_1.$hg)(workHome), 'renamed');
            await fileService.move(workHome, renamedWorkHome);
            const resources = await service.moveEntries(workHome, renamedWorkHome);
            const renamedWorkingCopy1Resource = (0, resources_1.$ig)(renamedWorkHome, (0, resources_1.$fg)(workingCopy1.resource));
            const renamedWorkingCopy2Resource = (0, resources_1.$ig)(renamedWorkHome, (0, resources_1.$fg)(workingCopy2.resource));
            assert.strictEqual(resources.length, 2);
            for (const resource of resources) {
                if (resource.toString() !== renamedWorkingCopy1Resource.toString() && resource.toString() !== renamedWorkingCopy2Resource.toString()) {
                    assert.fail(`Unexpected history resource: ${resource.toString()}`);
                }
            }
            entries = await service.getEntries(workingCopy1.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            entries = await service.getEntries(workingCopy2.resource, cancellation_1.CancellationToken.None);
            assert.strictEqual(entries.length, 0);
            entries = await service.getEntries(renamedWorkingCopy1Resource, cancellation_1.CancellationToken.None);
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
            entries = await service.getEntries(renamedWorkingCopy2Resource, cancellation_1.CancellationToken.None);
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
            const all = await service.getAll(cancellation_1.CancellationToken.None);
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
//# sourceMappingURL=workingCopyHistoryService.test.js.map