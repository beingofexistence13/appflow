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
        class TestParcelWatcher extends parcelWatcher_1.$w$b {
            testNormalizePaths(paths, excludes = []) {
                // Work with strings as paths to simplify testing
                const requests = paths.map(path => {
                    return { path, excludes, recursive: true };
                });
                return this.M(requests, false /* validate paths skipped for tests */).map(request => request.path);
            }
            async watch(requests) {
                await super.watch(requests);
                await this.whenReady();
            }
            async whenReady() {
                for (const [, watcher] of this.h) {
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
            testDir = (0, testUtils_1.$oT)((0, os_1.tmpdir)(), 'vsctests', 'filewatcher');
            const sourceDir = network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/service').fsPath;
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
            await (0, async_1.$Hg)(1);
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
            const newFilePath = (0, path_1.$9d)(testDir, 'deep', 'newFile.txt');
            let changeFuture = awaitEvent(watcher, newFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newFilePath, 'Hello World');
            await changeFuture;
            // New folder
            const newFolderPath = (0, path_1.$9d)(testDir, 'deep', 'New Folder');
            changeFuture = awaitEvent(watcher, newFolderPath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.mkdir(newFolderPath);
            await changeFuture;
            // Rename file
            let renamedFilePath = (0, path_1.$9d)(testDir, 'deep', 'renamedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, newFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, renamedFilePath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(newFilePath, renamedFilePath);
            await changeFuture;
            // Rename folder
            let renamedFolderPath = (0, path_1.$9d)(testDir, 'deep', 'Renamed Folder');
            changeFuture = Promise.all([
                awaitEvent(watcher, newFolderPath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, renamedFolderPath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(newFolderPath, renamedFolderPath);
            await changeFuture;
            // Rename file (same name, different case)
            const caseRenamedFilePath = (0, path_1.$9d)(testDir, 'deep', 'RenamedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, caseRenamedFilePath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFilePath, caseRenamedFilePath);
            await changeFuture;
            renamedFilePath = caseRenamedFilePath;
            // Rename folder (same name, different case)
            const caseRenamedFolderPath = (0, path_1.$9d)(testDir, 'deep', 'REnamed Folder');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFolderPath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, caseRenamedFolderPath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFolderPath, caseRenamedFolderPath);
            await changeFuture;
            renamedFolderPath = caseRenamedFolderPath;
            // Move file
            const movedFilepath = (0, path_1.$9d)(testDir, 'movedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, movedFilepath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFilePath, movedFilepath);
            await changeFuture;
            // Move folder
            const movedFolderpath = (0, path_1.$9d)(testDir, 'Moved Folder');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFolderPath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, movedFolderpath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFolderPath, movedFolderpath);
            await changeFuture;
            // Copy file
            const copiedFilepath = (0, path_1.$9d)(testDir, 'deep', 'copiedFile.txt');
            changeFuture = awaitEvent(watcher, copiedFilepath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copyFile(movedFilepath, copiedFilepath);
            await changeFuture;
            // Copy folder
            const copiedFolderpath = (0, path_1.$9d)(testDir, 'deep', 'Copied Folder');
            changeFuture = awaitEvent(watcher, copiedFolderpath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copy(movedFolderpath, copiedFolderpath, { preserveSymlinks: false });
            await changeFuture;
            // Change file
            changeFuture = awaitEvent(watcher, copiedFilepath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.writeFile(copiedFilepath, 'Hello Change');
            await changeFuture;
            // Create new file
            const anotherNewFilePath = (0, path_1.$9d)(testDir, 'deep', 'anotherNewFile.txt');
            changeFuture = awaitEvent(watcher, anotherNewFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(anotherNewFilePath, 'Hello Another World');
            await changeFuture;
            // Read file does not emit event
            changeFuture = awaitEvent(watcher, anotherNewFilePath, 0 /* FileChangeType.UPDATED */, 'unexpected-event-from-read-file');
            await pfs_1.Promises.readFile(anotherNewFilePath);
            await Promise.race([(0, async_1.$Hg)(100), changeFuture]);
            // Stat file does not emit event
            changeFuture = awaitEvent(watcher, anotherNewFilePath, 0 /* FileChangeType.UPDATED */, 'unexpected-event-from-stat');
            await pfs_1.Promises.stat(anotherNewFilePath);
            await Promise.race([(0, async_1.$Hg)(100), changeFuture]);
            // Stat folder does not emit event
            changeFuture = awaitEvent(watcher, copiedFolderpath, 0 /* FileChangeType.UPDATED */, 'unexpected-event-from-stat');
            await pfs_1.Promises.stat(copiedFolderpath);
            await Promise.race([(0, async_1.$Hg)(100), changeFuture]);
            // Delete file
            changeFuture = awaitEvent(watcher, copiedFilepath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.unlink(copiedFilepath);
            await changeFuture;
            // Delete folder
            changeFuture = awaitEvent(watcher, copiedFolderpath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.rmdir(copiedFolderpath);
            await changeFuture;
        });
        (platform_1.$j /* this test seems not possible with fsevents backend */ ? test.skip : test)('basics (atomic writes)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }]);
            // Delete + Recreate file
            const newFilePath = (0, path_1.$9d)(testDir, 'deep', 'conway.js');
            const changeFuture = awaitEvent(watcher, newFilePath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.unlink(newFilePath);
            pfs_1.Promises.writeFile(newFilePath, 'Hello Atomic World');
            await changeFuture;
        });
        (!platform_1.$k /* polling is only used in linux environments (WSL) */ ? test.skip : test)('basics (polling)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], pollingInterval: 100, recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'deep', 'newFile.txt'));
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
            await pfs_1.Promises.mkdir((0, path_1.$9d)(testDir, 'deep-multiple'));
            // multiple add
            const newFilePath1 = (0, path_1.$9d)(testDir, 'newFile-1.txt');
            const newFilePath2 = (0, path_1.$9d)(testDir, 'newFile-2.txt');
            const newFilePath3 = (0, path_1.$9d)(testDir, 'newFile-3.txt');
            const newFilePath4 = (0, path_1.$9d)(testDir, 'deep-multiple', 'newFile-1.txt');
            const newFilePath5 = (0, path_1.$9d)(testDir, 'deep-multiple', 'newFile-2.txt');
            const newFilePath6 = (0, path_1.$9d)(testDir, 'deep-multiple', 'newFile-3.txt');
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
            const copyFuture1 = awaitEvent(watcher, (0, path_1.$9d)(testDir, 'deep-multiple-copy', 'newFile-1.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture2 = awaitEvent(watcher, (0, path_1.$9d)(testDir, 'deep-multiple-copy', 'newFile-2.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture3 = awaitEvent(watcher, (0, path_1.$9d)(testDir, 'deep-multiple-copy', 'newFile-3.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture4 = awaitEvent(watcher, (0, path_1.$9d)(testDir, 'deep-multiple-copy'), 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copy((0, path_1.$9d)(testDir, 'deep-multiple'), (0, path_1.$9d)(testDir, 'deep-multiple-copy'), { preserveSymlinks: false });
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
            const deleteFolderFuture1 = awaitEvent(watcher, (0, path_1.$9d)(testDir, 'deep-multiple'), 2 /* FileChangeType.DELETED */);
            const deleteFolderFuture2 = awaitEvent(watcher, (0, path_1.$9d)(testDir, 'deep-multiple-copy'), 2 /* FileChangeType.DELETED */);
            await Promise.all([pfs_1.Promises.rm((0, path_1.$9d)(testDir, 'deep-multiple'), pfs_1.RimRafMode.UNLINK), pfs_1.Promises.rm((0, path_1.$9d)(testDir, 'deep-multiple-copy'), pfs_1.RimRafMode.UNLINK)]);
            await Promise.all([deleteFolderFuture1, deleteFolderFuture2]);
        });
        test('subsequent watch updates watchers (path)', async function () {
            await watcher.watch([{ path: testDir, excludes: [(0, path_1.$9d)((0, fs_1.realpathSync)(testDir), 'unrelated')], recursive: true }]);
            // New file (*.txt)
            let newTextFilePath = (0, path_1.$9d)(testDir, 'deep', 'newFile.txt');
            let changeFuture = awaitEvent(watcher, newTextFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newTextFilePath, 'Hello World');
            await changeFuture;
            await watcher.watch([{ path: (0, path_1.$9d)(testDir, 'deep'), excludes: [(0, path_1.$9d)((0, fs_1.realpathSync)(testDir), 'unrelated')], recursive: true }]);
            newTextFilePath = (0, path_1.$9d)(testDir, 'deep', 'newFile2.txt');
            changeFuture = awaitEvent(watcher, newTextFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newTextFilePath, 'Hello World');
            await changeFuture;
            await watcher.watch([{ path: (0, path_1.$9d)(testDir, 'deep'), excludes: [(0, fs_1.realpathSync)(testDir)], recursive: true }]);
            await watcher.watch([{ path: (0, path_1.$9d)(testDir, 'deep'), excludes: [], recursive: true }]);
            newTextFilePath = (0, path_1.$9d)(testDir, 'deep', 'newFile3.txt');
            changeFuture = awaitEvent(watcher, newTextFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newTextFilePath, 'Hello World');
            await changeFuture;
        });
        test('invalid path does not crash watcher', async function () {
            await watcher.watch([
                { path: testDir, excludes: [], recursive: true },
                { path: (0, path_1.$9d)(testDir, 'invalid-folder'), excludes: [], recursive: true },
                { path: network_1.$2f.asFileUri('').fsPath, excludes: [], recursive: true }
            ]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'deep', 'newFile.txt'));
        });
        test('subsequent watch updates watchers (excludes)', async function () {
            await watcher.watch([{ path: testDir, excludes: [(0, fs_1.realpathSync)(testDir)], recursive: true }]);
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'deep', 'newFile.txt'));
        });
        test('subsequent watch updates watchers (includes)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['nothing'], recursive: true }]);
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'deep', 'newFile.txt'));
        });
        test('includes are supported', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['**/deep/**'], recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'deep', 'newFile.txt'));
        });
        test('includes are supported (relative pattern explicit)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: [{ base: testDir, pattern: 'deep/newFile.txt' }], recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'deep', 'newFile.txt'));
        });
        test('includes are supported (relative pattern implicit)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['deep/newFile.txt'], recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'deep', 'newFile.txt'));
        });
        test('excludes are supported (path)', async function () {
            return testExcludes([(0, path_1.$9d)((0, fs_1.realpathSync)(testDir), 'deep')]);
        });
        test('excludes are supported (glob)', function () {
            return testExcludes(['deep/**']);
        });
        async function testExcludes(excludes) {
            await watcher.watch([{ path: testDir, excludes, recursive: true }]);
            // New file (*.txt)
            const newTextFilePath = (0, path_1.$9d)(testDir, 'deep', 'newFile.txt');
            const changeFuture = awaitEvent(watcher, newTextFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newTextFilePath, 'Hello World');
            const res = await Promise.any([
                (0, async_1.$Hg)(500).then(() => true),
                changeFuture.then(() => false)
            ]);
            if (!res) {
                assert.fail('Unexpected change event');
            }
        }
        (platform_1.$i /* windows: cannot create file symbolic link without elevated context */ ? test.skip : test)('symlink support (root)', async function () {
            const link = (0, path_1.$9d)(testDir, 'deep-linked');
            const linkTarget = (0, path_1.$9d)(testDir, 'deep');
            await pfs_1.Promises.symlink(linkTarget, link);
            await watcher.watch([{ path: link, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(link, 'newFile.txt'));
        });
        (platform_1.$i /* windows: cannot create file symbolic link without elevated context */ ? test.skip : test)('symlink support (via extra watch)', async function () {
            const link = (0, path_1.$9d)(testDir, 'deep-linked');
            const linkTarget = (0, path_1.$9d)(testDir, 'deep');
            await pfs_1.Promises.symlink(linkTarget, link);
            await watcher.watch([{ path: testDir, excludes: [], recursive: true }, { path: link, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(link, 'newFile.txt'));
        });
        (!platform_1.$i /* UNC is windows only */ ? test.skip : test)('unc support', async function () {
            // Local UNC paths are in the form of: \\localhost\c$\my_dir
            const uncPath = `\\\\localhost\\${(0, extpath_1.$Nf)(testDir)?.toLowerCase()}$\\${(0, strings_1.$ue)(testDir.substr(testDir.indexOf(':') + 1), '\\')}`;
            await watcher.watch([{ path: uncPath, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(uncPath, 'deep', 'newFile.txt'));
        });
        (platform_1.$k /* linux: is case sensitive */ ? test.skip : test)('wrong casing', async function () {
            const deepWrongCasedPath = (0, path_1.$9d)(testDir, 'DEEP');
            await watcher.watch([{ path: deepWrongCasedPath, excludes: [], recursive: true }]);
            return basicCrudTest((0, path_1.$9d)(deepWrongCasedPath, 'newFile.txt'));
        });
        test('invalid folder does not explode', async function () {
            const invalidPath = (0, path_1.$9d)(testDir, 'invalid');
            await watcher.watch([{ path: invalidPath, excludes: [], recursive: true }]);
        });
        test('deleting watched path is handled properly', async function () {
            const watchedPath = (0, path_1.$9d)(testDir, 'deep');
            await watcher.watch([{ path: watchedPath, excludes: [], recursive: true }]);
            // Delete watched path and await
            const warnFuture = awaitMessage(watcher, 'warn');
            await pfs_1.Promises.rm(watchedPath, pfs_1.RimRafMode.UNLINK);
            await warnFuture;
            // Restore watched path
            await (0, async_1.$Hg)(1500); // node.js watcher used for monitoring folder restore is async
            await pfs_1.Promises.mkdir(watchedPath);
            await (0, async_1.$Hg)(1500); // restart is delayed
            await watcher.whenReady();
            // Verify events come in again
            const newFilePath = (0, path_1.$9d)(watchedPath, 'newFile.txt');
            const changeFuture = awaitEvent(watcher, newFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newFilePath, 'Hello World');
            await changeFuture;
        });
        test('should not exclude roots that do not overlap', () => {
            if (platform_1.$i) {
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
            if (platform_1.$i) {
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
//# sourceMappingURL=parcelWatcher.integrationTest.js.map