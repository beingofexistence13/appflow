/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "os", "vs/base/common/async", "vs/base/common/path", "vs/base/common/platform", "vs/base/node/pfs", "vs/base/test/node/testUtils", "vs/platform/files/node/watcher/parcel/parcelWatcher", "vs/base/common/extpath", "vs/base/common/strings", "vs/base/common/network"], function (require, exports, assert, fs_1, os_1, async_1, path_1, platform_1, pfs_1, testUtils_1, parcelWatcher_1, extpath_1, strings_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // this suite has shown flaky runs in Azure pipelines where
    // tasks would just hang and timeout after a while (not in
    // mocha but generally). as such they will run only on demand
    // whenever we update the watcher library.
    ((process.env['BUILD_SOURCEVERSION'] || process.env['CI']) ? suite.skip : testUtils_1.flakySuite)('File Watcher (parcel)', () => {
        class TestParcelWatcher extends parcelWatcher_1.ParcelWatcher {
            testNormalizePaths(paths, excludes = []) {
                // Work with strings as paths to simplify testing
                const requests = paths.map(path => {
                    return { path, excludes, recursive: true };
                });
                return this.normalizeRequests(requests, false /* validate paths skipped for tests */).map(request => request.path);
            }
            async watch(requests) {
                await super.watch(requests);
                await this.whenReady();
            }
            async whenReady() {
                for (const [, watcher] of this.watchers) {
                    await watcher.ready;
                }
            }
        }
        let testDir;
        let watcher;
        let loggingEnabled = false;
        function enableLogging(enable) {
            loggingEnabled = enable;
            watcher?.setVerboseLogging(enable);
        }
        enableLogging(false);
        setup(async () => {
            watcher = new TestParcelWatcher();
            watcher.setVerboseLogging(loggingEnabled);
            watcher.onDidLogMessage(e => {
                if (loggingEnabled) {
                    console.log(`[recursive watcher test message] ${e.message}`);
                }
            });
            watcher.onDidError(e => {
                if (loggingEnabled) {
                    console.log(`[recursive watcher test error] ${e}`);
                }
            });
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'filewatcher');
            const sourceDir = network_1.FileAccess.asFileUri('vs/platform/files/test/node/fixtures/service').fsPath;
            await pfs_1.Promises.copy(sourceDir, testDir, { preserveSymlinks: false });
        });
        teardown(async () => {
            await watcher.stop();
            watcher.dispose();
            // Possible that the file watcher is still holding
            // onto the folders on Windows specifically and the
            // unlink would fail. In that case, do not fail the
            // test suite.
            return pfs_1.Promises.rm(testDir).catch(error => console.error(error));
        });
        function toMsg(type) {
            switch (type) {
                case 1 /* FileChangeType.ADDED */: return 'added';
                case 2 /* FileChangeType.DELETED */: return 'deleted';
                default: return 'changed';
            }
        }
        async function awaitEvent(service, path, type, failOnEventReason) {
            if (loggingEnabled) {
                console.log(`Awaiting change type '${toMsg(type)}' on file '${path}'`);
            }
            // Await the event
            const res = await new Promise((resolve, reject) => {
                const disposable = service.onDidChangeFile(events => {
                    for (const event of events) {
                        if (event.path === path && event.type === type) {
                            disposable.dispose();
                            if (failOnEventReason) {
                                reject(new Error(`Unexpected file event: ${failOnEventReason}`));
                            }
                            else {
                                setImmediate(() => resolve(events)); // copied from parcel watcher tests, seems to drop unrelated events on macOS
                            }
                            break;
                        }
                    }
                });
            });
            // Unwind from the event call stack: we have seen crashes in Parcel
            // when e.g. calling `unsubscribe` directly from the stack of a file
            // change event
            // Refs: https://github.com/microsoft/vscode/issues/137430
            await (0, async_1.timeout)(1);
            return res;
        }
        function awaitMessage(service, type) {
            if (loggingEnabled) {
                console.log(`Awaiting message of type ${type}`);
            }
            // Await the message
            return new Promise(resolve => {
                const disposable = service.onDidLogMessage(msg => {
                    if (msg.type === type) {
                        disposable.dispose();
                        resolve();
                    }
                });
            });
        }
        test('basics', async function () {
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }]);
            // New file
            const newFilePath = (0, path_1.join)(testDir, 'deep', 'newFile.txt');
            let changeFuture = awaitEvent(watcher, newFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newFilePath, 'Hello World');
            await changeFuture;
            // New folder
            const newFolderPath = (0, path_1.join)(testDir, 'deep', 'New Folder');
            changeFuture = awaitEvent(watcher, newFolderPath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.mkdir(newFolderPath);
            await changeFuture;
            // Rename file
            let renamedFilePath = (0, path_1.join)(testDir, 'deep', 'renamedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, newFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, renamedFilePath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(newFilePath, renamedFilePath);
            await changeFuture;
            // Rename folder
            let renamedFolderPath = (0, path_1.join)(testDir, 'deep', 'Renamed Folder');
            changeFuture = Promise.all([
                awaitEvent(watcher, newFolderPath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, renamedFolderPath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(newFolderPath, renamedFolderPath);
            await changeFuture;
            // Rename file (same name, different case)
            const caseRenamedFilePath = (0, path_1.join)(testDir, 'deep', 'RenamedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, caseRenamedFilePath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFilePath, caseRenamedFilePath);
            await changeFuture;
            renamedFilePath = caseRenamedFilePath;
            // Rename folder (same name, different case)
            const caseRenamedFolderPath = (0, path_1.join)(testDir, 'deep', 'REnamed Folder');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFolderPath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, caseRenamedFolderPath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFolderPath, caseRenamedFolderPath);
            await changeFuture;
            renamedFolderPath = caseRenamedFolderPath;
            // Move file
            const movedFilepath = (0, path_1.join)(testDir, 'movedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, movedFilepath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFilePath, movedFilepath);
            await changeFuture;
            // Move folder
            const movedFolderpath = (0, path_1.join)(testDir, 'Moved Folder');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFolderPath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, movedFolderpath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFolderPath, movedFolderpath);
            await changeFuture;
            // Copy file
            const copiedFilepath = (0, path_1.join)(testDir, 'deep', 'copiedFile.txt');
            changeFuture = awaitEvent(watcher, copiedFilepath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copyFile(movedFilepath, copiedFilepath);
            await changeFuture;
            // Copy folder
            const copiedFolderpath = (0, path_1.join)(testDir, 'deep', 'Copied Folder');
            changeFuture = awaitEvent(watcher, copiedFolderpath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copy(movedFolderpath, copiedFolderpath, { preserveSymlinks: false });
            await changeFuture;
            // Change file
            changeFuture = awaitEvent(watcher, copiedFilepath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.writeFile(copiedFilepath, 'Hello Change');
            await changeFuture;
            // Create new file
            const anotherNewFilePath = (0, path_1.join)(testDir, 'deep', 'anotherNewFile.txt');
            changeFuture = awaitEvent(watcher, anotherNewFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(anotherNewFilePath, 'Hello Another World');
            await changeFuture;
            // Read file does not emit event
            changeFuture = awaitEvent(watcher, anotherNewFilePath, 0 /* FileChangeType.UPDATED */, 'unexpected-event-from-read-file');
            await pfs_1.Promises.readFile(anotherNewFilePath);
            await Promise.race([(0, async_1.timeout)(100), changeFuture]);
            // Stat file does not emit event
            changeFuture = awaitEvent(watcher, anotherNewFilePath, 0 /* FileChangeType.UPDATED */, 'unexpected-event-from-stat');
            await pfs_1.Promises.stat(anotherNewFilePath);
            await Promise.race([(0, async_1.timeout)(100), changeFuture]);
            // Stat folder does not emit event
            changeFuture = awaitEvent(watcher, copiedFolderpath, 0 /* FileChangeType.UPDATED */, 'unexpected-event-from-stat');
            await pfs_1.Promises.stat(copiedFolderpath);
            await Promise.race([(0, async_1.timeout)(100), changeFuture]);
            // Delete file
            changeFuture = awaitEvent(watcher, copiedFilepath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.unlink(copiedFilepath);
            await changeFuture;
            // Delete folder
            changeFuture = awaitEvent(watcher, copiedFolderpath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.rmdir(copiedFolderpath);
            await changeFuture;
        });
        (platform_1.isMacintosh /* this test seems not possible with fsevents backend */ ? test.skip : test)('basics (atomic writes)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }]);
            // Delete + Recreate file
            const newFilePath = (0, path_1.join)(testDir, 'deep', 'conway.js');
            const changeFuture = awaitEvent(watcher, newFilePath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.unlink(newFilePath);
            pfs_1.Promises.writeFile(newFilePath, 'Hello Atomic World');
            await changeFuture;
        });
        (!platform_1.isLinux /* polling is only used in linux environments (WSL) */ ? test.skip : test)('basics (polling)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], pollingInterval: 100, recursive: true }]);
            return basicCrudTest((0, path_1.join)(testDir, 'deep', 'newFile.txt'));
        });
        async function basicCrudTest(filePath) {
            // New file
            let changeFuture = awaitEvent(watcher, filePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(filePath, 'Hello World');
            await changeFuture;
            // Change file
            changeFuture = awaitEvent(watcher, filePath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.writeFile(filePath, 'Hello Change');
            await changeFuture;
            // Delete file
            changeFuture = awaitEvent(watcher, filePath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.unlink(filePath);
            await changeFuture;
        }
        test('multiple events', async function () {
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }]);
            await pfs_1.Promises.mkdir((0, path_1.join)(testDir, 'deep-multiple'));
            // multiple add
            const newFilePath1 = (0, path_1.join)(testDir, 'newFile-1.txt');
            const newFilePath2 = (0, path_1.join)(testDir, 'newFile-2.txt');
            const newFilePath3 = (0, path_1.join)(testDir, 'newFile-3.txt');
            const newFilePath4 = (0, path_1.join)(testDir, 'deep-multiple', 'newFile-1.txt');
            const newFilePath5 = (0, path_1.join)(testDir, 'deep-multiple', 'newFile-2.txt');
            const newFilePath6 = (0, path_1.join)(testDir, 'deep-multiple', 'newFile-3.txt');
            const addedFuture1 = awaitEvent(watcher, newFilePath1, 1 /* FileChangeType.ADDED */);
            const addedFuture2 = awaitEvent(watcher, newFilePath2, 1 /* FileChangeType.ADDED */);
            const addedFuture3 = awaitEvent(watcher, newFilePath3, 1 /* FileChangeType.ADDED */);
            const addedFuture4 = awaitEvent(watcher, newFilePath4, 1 /* FileChangeType.ADDED */);
            const addedFuture5 = awaitEvent(watcher, newFilePath5, 1 /* FileChangeType.ADDED */);
            const addedFuture6 = awaitEvent(watcher, newFilePath6, 1 /* FileChangeType.ADDED */);
            await Promise.all([
                await pfs_1.Promises.writeFile(newFilePath1, 'Hello World 1'),
                await pfs_1.Promises.writeFile(newFilePath2, 'Hello World 2'),
                await pfs_1.Promises.writeFile(newFilePath3, 'Hello World 3'),
                await pfs_1.Promises.writeFile(newFilePath4, 'Hello World 4'),
                await pfs_1.Promises.writeFile(newFilePath5, 'Hello World 5'),
                await pfs_1.Promises.writeFile(newFilePath6, 'Hello World 6')
            ]);
            await Promise.all([addedFuture1, addedFuture2, addedFuture3, addedFuture4, addedFuture5, addedFuture6]);
            // multiple change
            const changeFuture1 = awaitEvent(watcher, newFilePath1, 0 /* FileChangeType.UPDATED */);
            const changeFuture2 = awaitEvent(watcher, newFilePath2, 0 /* FileChangeType.UPDATED */);
            const changeFuture3 = awaitEvent(watcher, newFilePath3, 0 /* FileChangeType.UPDATED */);
            const changeFuture4 = awaitEvent(watcher, newFilePath4, 0 /* FileChangeType.UPDATED */);
            const changeFuture5 = awaitEvent(watcher, newFilePath5, 0 /* FileChangeType.UPDATED */);
            const changeFuture6 = awaitEvent(watcher, newFilePath6, 0 /* FileChangeType.UPDATED */);
            await Promise.all([
                await pfs_1.Promises.writeFile(newFilePath1, 'Hello Update 1'),
                await pfs_1.Promises.writeFile(newFilePath2, 'Hello Update 2'),
                await pfs_1.Promises.writeFile(newFilePath3, 'Hello Update 3'),
                await pfs_1.Promises.writeFile(newFilePath4, 'Hello Update 4'),
                await pfs_1.Promises.writeFile(newFilePath5, 'Hello Update 5'),
                await pfs_1.Promises.writeFile(newFilePath6, 'Hello Update 6')
            ]);
            await Promise.all([changeFuture1, changeFuture2, changeFuture3, changeFuture4, changeFuture5, changeFuture6]);
            // copy with multiple files
            const copyFuture1 = awaitEvent(watcher, (0, path_1.join)(testDir, 'deep-multiple-copy', 'newFile-1.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture2 = awaitEvent(watcher, (0, path_1.join)(testDir, 'deep-multiple-copy', 'newFile-2.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture3 = awaitEvent(watcher, (0, path_1.join)(testDir, 'deep-multiple-copy', 'newFile-3.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture4 = awaitEvent(watcher, (0, path_1.join)(testDir, 'deep-multiple-copy'), 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copy((0, path_1.join)(testDir, 'deep-multiple'), (0, path_1.join)(testDir, 'deep-multiple-copy'), { preserveSymlinks: false });
            await Promise.all([copyFuture1, copyFuture2, copyFuture3, copyFuture4]);
            // multiple delete (single files)
            const deleteFuture1 = awaitEvent(watcher, newFilePath1, 2 /* FileChangeType.DELETED */);
            const deleteFuture2 = awaitEvent(watcher, newFilePath2, 2 /* FileChangeType.DELETED */);
            const deleteFuture3 = awaitEvent(watcher, newFilePath3, 2 /* FileChangeType.DELETED */);
            const deleteFuture4 = awaitEvent(watcher, newFilePath4, 2 /* FileChangeType.DELETED */);
            const deleteFuture5 = awaitEvent(watcher, newFilePath5, 2 /* FileChangeType.DELETED */);
            const deleteFuture6 = awaitEvent(watcher, newFilePath6, 2 /* FileChangeType.DELETED */);
            await Promise.all([
                await pfs_1.Promises.unlink(newFilePath1),
                await pfs_1.Promises.unlink(newFilePath2),
                await pfs_1.Promises.unlink(newFilePath3),
                await pfs_1.Promises.unlink(newFilePath4),
                await pfs_1.Promises.unlink(newFilePath5),
                await pfs_1.Promises.unlink(newFilePath6)
            ]);
            await Promise.all([deleteFuture1, deleteFuture2, deleteFuture3, deleteFuture4, deleteFuture5, deleteFuture6]);
            // multiple delete (folder)
            const deleteFolderFuture1 = awaitEvent(watcher, (0, path_1.join)(testDir, 'deep-multiple'), 2 /* FileChangeType.DELETED */);
            const deleteFolderFuture2 = awaitEvent(watcher, (0, path_1.join)(testDir, 'deep-multiple-copy'), 2 /* FileChangeType.DELETED */);
            await Promise.all([pfs_1.Promises.rm((0, path_1.join)(testDir, 'deep-multiple'), pfs_1.RimRafMode.UNLINK), pfs_1.Promises.rm((0, path_1.join)(testDir, 'deep-multiple-copy'), pfs_1.RimRafMode.UNLINK)]);
            await Promise.all([deleteFolderFuture1, deleteFolderFuture2]);
        });
        test('subsequent watch updates watchers (path)', async function () {
            await watcher.watch([{ path: testDir, excludes: [(0, path_1.join)((0, fs_1.realpathSync)(testDir), 'unrelated')], recursive: true }]);
            // New file (*.txt)
            let newTextFilePath = (0, path_1.join)(testDir, 'deep', 'newFile.txt');
            let changeFuture = awaitEvent(watcher, newTextFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newTextFilePath, 'Hello World');
            await changeFuture;
            await watcher.watch([{ path: (0, path_1.join)(testDir, 'deep'), excludes: [(0, path_1.join)((0, fs_1.realpathSync)(testDir), 'unrelated')], recursive: true }]);
            newTextFilePath = (0, path_1.join)(testDir, 'deep', 'newFile2.txt');
            changeFuture = awaitEvent(watcher, newTextFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newTextFilePath, 'Hello World');
            await changeFuture;
            await watcher.watch([{ path: (0, path_1.join)(testDir, 'deep'), excludes: [(0, fs_1.realpathSync)(testDir)], recursive: true }]);
            await watcher.watch([{ path: (0, path_1.join)(testDir, 'deep'), excludes: [], recursive: true }]);
            newTextFilePath = (0, path_1.join)(testDir, 'deep', 'newFile3.txt');
            changeFuture = awaitEvent(watcher, newTextFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newTextFilePath, 'Hello World');
            await changeFuture;
        });
        test('invalid path does not crash watcher', async function () {
            await watcher.watch([
                { path: testDir, excludes: [], recursive: true },
                { path: (0, path_1.join)(testDir, 'invalid-folder'), excludes: [], recursive: true },
                { path: network_1.FileAccess.asFileUri('').fsPath, excludes: [], recursive: true }
            ]);
            return basicCrudTest((0, path_1.join)(testDir, 'deep', 'newFile.txt'));
        });
        test('subsequent watch updates watchers (excludes)', async function () {
            await watcher.watch([{ path: testDir, excludes: [(0, fs_1.realpathSync)(testDir)], recursive: true }]);
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.join)(testDir, 'deep', 'newFile.txt'));
        });
        test('subsequent watch updates watchers (includes)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['nothing'], recursive: true }]);
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.join)(testDir, 'deep', 'newFile.txt'));
        });
        test('includes are supported', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['**/deep/**'], recursive: true }]);
            return basicCrudTest((0, path_1.join)(testDir, 'deep', 'newFile.txt'));
        });
        test('includes are supported (relative pattern explicit)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: [{ base: testDir, pattern: 'deep/newFile.txt' }], recursive: true }]);
            return basicCrudTest((0, path_1.join)(testDir, 'deep', 'newFile.txt'));
        });
        test('includes are supported (relative pattern implicit)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['deep/newFile.txt'], recursive: true }]);
            return basicCrudTest((0, path_1.join)(testDir, 'deep', 'newFile.txt'));
        });
        test('excludes are supported (path)', async function () {
            return testExcludes([(0, path_1.join)((0, fs_1.realpathSync)(testDir), 'deep')]);
        });
        test('excludes are supported (glob)', function () {
            return testExcludes(['deep/**']);
        });
        async function testExcludes(excludes) {
            await watcher.watch([{ path: testDir, excludes, recursive: true }]);
            // New file (*.txt)
            const newTextFilePath = (0, path_1.join)(testDir, 'deep', 'newFile.txt');
            const changeFuture = awaitEvent(watcher, newTextFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newTextFilePath, 'Hello World');
            const res = await Promise.any([
                (0, async_1.timeout)(500).then(() => true),
                changeFuture.then(() => false)
            ]);
            if (!res) {
                assert.fail('Unexpected change event');
            }
        }
        (platform_1.isWindows /* windows: cannot create file symbolic link without elevated context */ ? test.skip : test)('symlink support (root)', async function () {
            const link = (0, path_1.join)(testDir, 'deep-linked');
            const linkTarget = (0, path_1.join)(testDir, 'deep');
            await pfs_1.Promises.symlink(linkTarget, link);
            await watcher.watch([{ path: link, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.join)(link, 'newFile.txt'));
        });
        (platform_1.isWindows /* windows: cannot create file symbolic link without elevated context */ ? test.skip : test)('symlink support (via extra watch)', async function () {
            const link = (0, path_1.join)(testDir, 'deep-linked');
            const linkTarget = (0, path_1.join)(testDir, 'deep');
            await pfs_1.Promises.symlink(linkTarget, link);
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }, { path: link, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.join)(link, 'newFile.txt'));
        });
        (!platform_1.isWindows /* UNC is windows only */ ? test.skip : test)('unc support', async function () {
            // Local UNC paths are in the form of: \\localhost\c$\my_dir
            const uncPath = `\\\\localhost\\${(0, extpath_1.getDriveLetter)(testDir)?.toLowerCase()}$\\${(0, strings_1.ltrim)(testDir.substr(testDir.indexOf(':') + 1), '\\')}`;
            await watcher.watch([{ path: uncPath, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.join)(uncPath, 'deep', 'newFile.txt'));
        });
        (platform_1.isLinux /* linux: is case sensitive */ ? test.skip : test)('wrong casing', async function () {
            const deepWrongCasedPath = (0, path_1.join)(testDir, 'DEEP');
            await watcher.watch([{ path: deepWrongCasedPath, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.join)(deepWrongCasedPath, 'newFile.txt'));
        });
        test('invalid folder does not explode', async function () {
            const invalidPath = (0, path_1.join)(testDir, 'invalid');
            await watcher.watch([{ path: invalidPath, excludes: [], recursive: true }]);
        });
        test('deleting watched path is handled properly', async function () {
            const watchedPath = (0, path_1.join)(testDir, 'deep');
            await watcher.watch([{ path: watchedPath, excludes: [], recursive: true }]);
            // Delete watched path and await
            const warnFuture = awaitMessage(watcher, 'warn');
            await pfs_1.Promises.rm(watchedPath, pfs_1.RimRafMode.UNLINK);
            await warnFuture;
            // Restore watched path
            await (0, async_1.timeout)(1500); // node.js watcher used for monitoring folder restore is async
            await pfs_1.Promises.mkdir(watchedPath);
            await (0, async_1.timeout)(1500); // restart is delayed
            await watcher.whenReady();
            // Verify events come in again
            const newFilePath = (0, path_1.join)(watchedPath, 'newFile.txt');
            const changeFuture = awaitEvent(watcher, newFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newFilePath, 'Hello World');
            await changeFuture;
        });
        test('should not exclude roots that do not overlap', () => {
            if (platform_1.isWindows) {
                assert.deepStrictEqual(watcher.testNormalizePaths(['C:\\a']), ['C:\\a']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['C:\\a', 'C:\\b']), ['C:\\a', 'C:\\b']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['C:\\a', 'C:\\b', 'C:\\c\\d\\e']), ['C:\\a', 'C:\\b', 'C:\\c\\d\\e']);
            }
            else {
                assert.deepStrictEqual(watcher.testNormalizePaths(['/a']), ['/a']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['/a', '/b']), ['/a', '/b']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['/a', '/b', '/c/d/e']), ['/a', '/b', '/c/d/e']);
            }
        });
        test('should remove sub-folders of other paths', () => {
            if (platform_1.isWindows) {
                assert.deepStrictEqual(watcher.testNormalizePaths(['C:\\a', 'C:\\a\\b']), ['C:\\a']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['C:\\a', 'C:\\b', 'C:\\a\\b']), ['C:\\a', 'C:\\b']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['C:\\b\\a', 'C:\\a', 'C:\\b', 'C:\\a\\b']), ['C:\\a', 'C:\\b']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['C:\\a', 'C:\\a\\b', 'C:\\a\\c\\d']), ['C:\\a']);
            }
            else {
                assert.deepStrictEqual(watcher.testNormalizePaths(['/a', '/a/b']), ['/a']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['/a', '/b', '/a/b']), ['/a', '/b']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['/b/a', '/a', '/b', '/a/b']), ['/a', '/b']);
                assert.deepStrictEqual(watcher.testNormalizePaths(['/a', '/a/b', '/a/c/d']), ['/a']);
            }
        });
        test('should ignore when everything excluded', () => {
            assert.deepStrictEqual(watcher.testNormalizePaths(['/foo/bar', '/bar'], ['**', 'something']), []);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyY2VsV2F0Y2hlci5pbnRlZ3JhdGlvblRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9maWxlcy90ZXN0L25vZGUvcGFyY2VsV2F0Y2hlci5pbnRlZ3JhdGlvblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFpQmhHLDJEQUEyRDtJQUMzRCwwREFBMEQ7SUFDMUQsNkRBQTZEO0lBQzdELDBDQUEwQztJQUUxQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsc0JBQVUsQ0FBQyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtRQUVuSCxNQUFNLGlCQUFrQixTQUFRLDZCQUFhO1lBRTVDLGtCQUFrQixDQUFDLEtBQWUsRUFBRSxXQUFxQixFQUFFO2dCQUUxRCxpREFBaUQ7Z0JBQ2pELE1BQU0sUUFBUSxHQUE2QixLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMzRCxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQzVDLENBQUMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEgsQ0FBQztZQUVRLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBa0M7Z0JBQ3RELE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLENBQUMs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