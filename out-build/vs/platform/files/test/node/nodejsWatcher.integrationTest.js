/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/path", "vs/base/node/pfs", "vs/base/test/node/testUtils", "vs/platform/files/node/watcher/nodejs/nodejsWatcherLib", "vs/base/common/platform", "vs/base/common/extpath", "vs/base/common/strings", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/files/node/watcher/nodejs/nodejsWatcher", "vs/base/common/network"], function (require, exports, os_1, path_1, pfs_1, testUtils_1, nodejsWatcherLib_1, platform_1, extpath_1, strings_1, async_1, cancellation_1, nodejsWatcher_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // this suite has shown flaky runs in Azure pipelines where
    // tasks would just hang and timeout after a while (not in
    // mocha but generally). as such they will run only on demand
    // whenever we update the watcher library.
    ((process.env['BUILD_SOURCEVERSION'] || process.env['CI']) ? suite.skip : testUtils_1.flakySuite)('File Watcher (node.js)', () => {
        class TestNodeJSWatcher extends nodejsWatcher_1.$1p {
            async watch(requests) {
                await super.watch(requests);
                await this.whenReady();
            }
            async whenReady() {
                for (const [, watcher] of this.c) {
                    await watcher.instance.ready;
                }
            }
        }
        class TestNodeJSFileWatcherLibrary extends nodejsWatcherLib_1.$Yp {
            constructor() {
                super(...arguments);
                this.H = new async_1.$2g();
                this.whenDisposed = this.H.p;
            }
            dispose() {
                super.dispose();
                this.H.complete();
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
            watcher = new TestNodeJSWatcher();
            watcher?.setVerboseLogging(loggingEnabled);
            watcher.onDidLogMessage(e => {
                if (loggingEnabled) {
                    console.log(`[non-recursive watcher test message] ${e.message}`);
                }
            });
            watcher.onDidError(e => {
                if (loggingEnabled) {
                    console.log(`[non-recursive watcher test error] ${e}`);
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
        async function awaitEvent(service, path, type) {
            if (loggingEnabled) {
                console.log(`Awaiting change type '${toMsg(type)}' on file '${path}'`);
            }
            // Await the event
            await new Promise(resolve => {
                const disposable = service.onDidChangeFile(events => {
                    for (const event of events) {
                        if (event.path === path && event.type === type) {
                            disposable.dispose();
                            resolve();
                            break;
                        }
                    }
                });
            });
        }
        test('basics (folder watch)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], recursive: false }]);
            // New file
            const newFilePath = (0, path_1.$9d)(testDir, 'newFile.txt');
            let changeFuture = awaitEvent(watcher, newFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newFilePath, 'Hello World');
            await changeFuture;
            // New folder
            const newFolderPath = (0, path_1.$9d)(testDir, 'New Folder');
            changeFuture = awaitEvent(watcher, newFolderPath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.mkdir(newFolderPath);
            await changeFuture;
            // Rename file
            let renamedFilePath = (0, path_1.$9d)(testDir, 'renamedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, newFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, renamedFilePath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(newFilePath, renamedFilePath);
            await changeFuture;
            // Rename folder
            let renamedFolderPath = (0, path_1.$9d)(testDir, 'Renamed Folder');
            changeFuture = Promise.all([
                awaitEvent(watcher, newFolderPath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, renamedFolderPath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(newFolderPath, renamedFolderPath);
            await changeFuture;
            // Rename file (same name, different case)
            const caseRenamedFilePath = (0, path_1.$9d)(testDir, 'RenamedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, caseRenamedFilePath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFilePath, caseRenamedFilePath);
            await changeFuture;
            renamedFilePath = caseRenamedFilePath;
            // Rename folder (same name, different case)
            const caseRenamedFolderPath = (0, path_1.$9d)(testDir, 'REnamed Folder');
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
            const copiedFilepath = (0, path_1.$9d)(testDir, 'copiedFile.txt');
            changeFuture = awaitEvent(watcher, copiedFilepath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copyFile(movedFilepath, copiedFilepath);
            await changeFuture;
            // Copy folder
            const copiedFolderpath = (0, path_1.$9d)(testDir, 'Copied Folder');
            changeFuture = awaitEvent(watcher, copiedFolderpath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copy(movedFolderpath, copiedFolderpath, { preserveSymlinks: false });
            await changeFuture;
            // Change file
            changeFuture = awaitEvent(watcher, copiedFilepath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.writeFile(copiedFilepath, 'Hello Change');
            await changeFuture;
            // Create new file
            const anotherNewFilePath = (0, path_1.$9d)(testDir, 'anotherNewFile.txt');
            changeFuture = awaitEvent(watcher, anotherNewFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(anotherNewFilePath, 'Hello Another World');
            await changeFuture;
            // Delete file
            changeFuture = awaitEvent(watcher, copiedFilepath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.unlink(copiedFilepath);
            await changeFuture;
            // Delete folder
            changeFuture = awaitEvent(watcher, copiedFolderpath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.rmdir(copiedFolderpath);
            await changeFuture;
            watcher.dispose();
        });
        test('basics (file watch)', async function () {
            const filePath = (0, path_1.$9d)(testDir, 'lorem.txt');
            await watcher.watch([{ path: filePath, excludes: [], recursive: false }]);
            // Change file
            let changeFuture = awaitEvent(watcher, filePath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.writeFile(filePath, 'Hello Change');
            await changeFuture;
            // Delete file
            changeFuture = awaitEvent(watcher, filePath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.unlink(filePath);
            await changeFuture;
            // Recreate watcher
            await pfs_1.Promises.writeFile(filePath, 'Hello Change');
            await watcher.watch([]);
            await watcher.watch([{ path: filePath, excludes: [], recursive: false }]);
            // Move file
            changeFuture = awaitEvent(watcher, filePath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.rename(filePath, `${filePath}-moved`);
            await changeFuture;
        });
        test('atomic writes (folder watch)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], recursive: false }]);
            // Delete + Recreate file
            const newFilePath = (0, path_1.$9d)(testDir, 'lorem.txt');
            const changeFuture = awaitEvent(watcher, newFilePath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.unlink(newFilePath);
            pfs_1.Promises.writeFile(newFilePath, 'Hello Atomic World');
            await changeFuture;
        });
        test('atomic writes (file watch)', async function () {
            const filePath = (0, path_1.$9d)(testDir, 'lorem.txt');
            await watcher.watch([{ path: filePath, excludes: [], recursive: false }]);
            // Delete + Recreate file
            const newFilePath = (0, path_1.$9d)(filePath);
            const changeFuture = awaitEvent(watcher, newFilePath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.unlink(newFilePath);
            pfs_1.Promises.writeFile(newFilePath, 'Hello Atomic World');
            await changeFuture;
        });
        test('multiple events (folder watch)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], recursive: false }]);
            // multiple add
            const newFilePath1 = (0, path_1.$9d)(testDir, 'newFile-1.txt');
            const newFilePath2 = (0, path_1.$9d)(testDir, 'newFile-2.txt');
            const newFilePath3 = (0, path_1.$9d)(testDir, 'newFile-3.txt');
            const addedFuture1 = awaitEvent(watcher, newFilePath1, 1 /* FileChangeType.ADDED */);
            const addedFuture2 = awaitEvent(watcher, newFilePath2, 1 /* FileChangeType.ADDED */);
            const addedFuture3 = awaitEvent(watcher, newFilePath3, 1 /* FileChangeType.ADDED */);
            await Promise.all([
                await pfs_1.Promises.writeFile(newFilePath1, 'Hello World 1'),
                await pfs_1.Promises.writeFile(newFilePath2, 'Hello World 2'),
                await pfs_1.Promises.writeFile(newFilePath3, 'Hello World 3'),
            ]);
            await Promise.all([addedFuture1, addedFuture2, addedFuture3]);
            // multiple change
            const changeFuture1 = awaitEvent(watcher, newFilePath1, 0 /* FileChangeType.UPDATED */);
            const changeFuture2 = awaitEvent(watcher, newFilePath2, 0 /* FileChangeType.UPDATED */);
            const changeFuture3 = awaitEvent(watcher, newFilePath3, 0 /* FileChangeType.UPDATED */);
            await Promise.all([
                await pfs_1.Promises.writeFile(newFilePath1, 'Hello Update 1'),
                await pfs_1.Promises.writeFile(newFilePath2, 'Hello Update 2'),
                await pfs_1.Promises.writeFile(newFilePath3, 'Hello Update 3'),
            ]);
            await Promise.all([changeFuture1, changeFuture2, changeFuture3]);
            // copy with multiple files
            const copyFuture1 = awaitEvent(watcher, (0, path_1.$9d)(testDir, 'newFile-1-copy.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture2 = awaitEvent(watcher, (0, path_1.$9d)(testDir, 'newFile-2-copy.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture3 = awaitEvent(watcher, (0, path_1.$9d)(testDir, 'newFile-3-copy.txt'), 1 /* FileChangeType.ADDED */);
            await Promise.all([
                pfs_1.Promises.copy((0, path_1.$9d)(testDir, 'newFile-1.txt'), (0, path_1.$9d)(testDir, 'newFile-1-copy.txt'), { preserveSymlinks: false }),
                pfs_1.Promises.copy((0, path_1.$9d)(testDir, 'newFile-2.txt'), (0, path_1.$9d)(testDir, 'newFile-2-copy.txt'), { preserveSymlinks: false }),
                pfs_1.Promises.copy((0, path_1.$9d)(testDir, 'newFile-3.txt'), (0, path_1.$9d)(testDir, 'newFile-3-copy.txt'), { preserveSymlinks: false })
            ]);
            await Promise.all([copyFuture1, copyFuture2, copyFuture3]);
            // multiple delete
            const deleteFuture1 = awaitEvent(watcher, newFilePath1, 2 /* FileChangeType.DELETED */);
            const deleteFuture2 = awaitEvent(watcher, newFilePath2, 2 /* FileChangeType.DELETED */);
            const deleteFuture3 = awaitEvent(watcher, newFilePath3, 2 /* FileChangeType.DELETED */);
            await Promise.all([
                await pfs_1.Promises.unlink(newFilePath1),
                await pfs_1.Promises.unlink(newFilePath2),
                await pfs_1.Promises.unlink(newFilePath3)
            ]);
            await Promise.all([deleteFuture1, deleteFuture2, deleteFuture3]);
        });
        test('multiple events (file watch)', async function () {
            const filePath = (0, path_1.$9d)(testDir, 'lorem.txt');
            await watcher.watch([{ path: filePath, excludes: [], recursive: false }]);
            // multiple change
            const changeFuture1 = awaitEvent(watcher, filePath, 0 /* FileChangeType.UPDATED */);
            await Promise.all([
                await pfs_1.Promises.writeFile(filePath, 'Hello Update 1'),
                await pfs_1.Promises.writeFile(filePath, 'Hello Update 2'),
                await pfs_1.Promises.writeFile(filePath, 'Hello Update 3'),
            ]);
            await Promise.all([changeFuture1]);
        });
        test('excludes can be updated (folder watch)', async function () {
            await watcher.watch([{ path: testDir, excludes: ['**'], recursive: false }]);
            await watcher.watch([{ path: testDir, excludes: [], recursive: false }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'files-excludes.txt'));
        });
        test('excludes are ignored (file watch)', async function () {
            const filePath = (0, path_1.$9d)(testDir, 'lorem.txt');
            await watcher.watch([{ path: filePath, excludes: ['**'], recursive: false }]);
            return basicCrudTest(filePath, true);
        });
        test('includes can be updated (folder watch)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['nothing'], recursive: false }]);
            await watcher.watch([{ path: testDir, excludes: [], recursive: false }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'files-includes.txt'));
        });
        test('non-includes are ignored (file watch)', async function () {
            const filePath = (0, path_1.$9d)(testDir, 'lorem.txt');
            await watcher.watch([{ path: filePath, excludes: [], includes: ['nothing'], recursive: false }]);
            return basicCrudTest(filePath, true);
        });
        test('includes are supported (folder watch)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['**/files-includes.txt'], recursive: false }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'files-includes.txt'));
        });
        test('includes are supported (folder watch, relative pattern explicit)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: [{ base: testDir, pattern: 'files-includes.txt' }], recursive: false }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'files-includes.txt'));
        });
        test('includes are supported (folder watch, relative pattern implicit)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['files-includes.txt'], recursive: false }]);
            return basicCrudTest((0, path_1.$9d)(testDir, 'files-includes.txt'));
        });
        (platform_1.$i /* windows: cannot create file symbolic link without elevated context */ ? test.skip : test)('symlink support (folder watch)', async function () {
            const link = (0, path_1.$9d)(testDir, 'deep-linked');
            const linkTarget = (0, path_1.$9d)(testDir, 'deep');
            await pfs_1.Promises.symlink(linkTarget, link);
            await watcher.watch([{ path: link, excludes: [], recursive: false }]);
            return basicCrudTest((0, path_1.$9d)(link, 'newFile.txt'));
        });
        async function basicCrudTest(filePath, skipAdd) {
            let changeFuture;
            // New file
            if (!skipAdd) {
                changeFuture = awaitEvent(watcher, filePath, 1 /* FileChangeType.ADDED */);
                await pfs_1.Promises.writeFile(filePath, 'Hello World');
                await changeFuture;
            }
            // Change file
            changeFuture = awaitEvent(watcher, filePath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.writeFile(filePath, 'Hello Change');
            await changeFuture;
            // Delete file
            changeFuture = awaitEvent(watcher, filePath, 2 /* FileChangeType.DELETED */);
            await pfs_1.Promises.unlink(await pfs_1.Promises.realpath(filePath)); // support symlinks
            await changeFuture;
        }
        (platform_1.$i /* windows: cannot create file symbolic link without elevated context */ ? test.skip : test)('symlink support (file watch)', async function () {
            const link = (0, path_1.$9d)(testDir, 'lorem.txt-linked');
            const linkTarget = (0, path_1.$9d)(testDir, 'lorem.txt');
            await pfs_1.Promises.symlink(linkTarget, link);
            await watcher.watch([{ path: link, excludes: [], recursive: false }]);
            return basicCrudTest(link, true);
        });
        (!platform_1.$i /* UNC is windows only */ ? test.skip : test)('unc support (folder watch)', async function () {
            // Local UNC paths are in the form of: \\localhost\c$\my_dir
            const uncPath = `\\\\localhost\\${(0, extpath_1.$Nf)(testDir)?.toLowerCase()}$\\${(0, strings_1.$ue)(testDir.substr(testDir.indexOf(':') + 1), '\\')}`;
            await watcher.watch([{ path: uncPath, excludes: [], recursive: false }]);
            return basicCrudTest((0, path_1.$9d)(uncPath, 'newFile.txt'));
        });
        (!platform_1.$i /* UNC is windows only */ ? test.skip : test)('unc support (file watch)', async function () {
            // Local UNC paths are in the form of: \\localhost\c$\my_dir
            const uncPath = `\\\\localhost\\${(0, extpath_1.$Nf)(testDir)?.toLowerCase()}$\\${(0, strings_1.$ue)(testDir.substr(testDir.indexOf(':') + 1), '\\')}\\lorem.txt`;
            await watcher.watch([{ path: uncPath, excludes: [], recursive: false }]);
            return basicCrudTest(uncPath, true);
        });
        (platform_1.$k /* linux: is case sensitive */ ? test.skip : test)('wrong casing (folder watch)', async function () {
            const wrongCase = (0, path_1.$9d)((0, path_1.$_d)(testDir), (0, path_1.$ae)(testDir).toUpperCase());
            await watcher.watch([{ path: wrongCase, excludes: [], recursive: false }]);
            return basicCrudTest((0, path_1.$9d)(wrongCase, 'newFile.txt'));
        });
        (platform_1.$k /* linux: is case sensitive */ ? test.skip : test)('wrong casing (file watch)', async function () {
            const filePath = (0, path_1.$9d)(testDir, 'LOREM.txt');
            await watcher.watch([{ path: filePath, excludes: [], recursive: false }]);
            return basicCrudTest(filePath, true);
        });
        test('invalid path does not explode', async function () {
            const invalidPath = (0, path_1.$9d)(testDir, 'invalid');
            await watcher.watch([{ path: invalidPath, excludes: [], recursive: false }]);
        });
        (platform_1.$j /* macOS: does not seem to report this */ ? test.skip : test)('deleting watched path is handled properly (folder watch)', async function () {
            const watchedPath = (0, path_1.$9d)(testDir, 'deep');
            const watcher = new TestNodeJSFileWatcherLibrary({ path: watchedPath, excludes: [], recursive: false }, changes => { });
            await watcher.ready;
            // Delete watched path and ensure watcher is now disposed
            pfs_1.Promises.rm(watchedPath, pfs_1.RimRafMode.UNLINK);
            await watcher.whenDisposed;
        });
        test('deleting watched path is handled properly (file watch)', async function () {
            const watchedPath = (0, path_1.$9d)(testDir, 'lorem.txt');
            const watcher = new TestNodeJSFileWatcherLibrary({ path: watchedPath, excludes: [], recursive: false }, changes => { });
            await watcher.ready;
            // Delete watched path and ensure watcher is now disposed
            pfs_1.Promises.unlink(watchedPath);
            await watcher.whenDisposed;
        });
        test('watchFileContents', async function () {
            const watchedPath = (0, path_1.$9d)(testDir, 'lorem.txt');
            const cts = new cancellation_1.$pd();
            const readyPromise = new async_1.$2g();
            const chunkPromise = new async_1.$2g();
            const watchPromise = (0, nodejsWatcherLib_1.$Zp)(watchedPath, () => chunkPromise.complete(), () => readyPromise.complete(), cts.token);
            await readyPromise.p;
            pfs_1.Promises.writeFile(watchedPath, 'Hello World');
            await chunkPromise.p;
            cts.cancel(); // this will resolve `watchPromise`
            return watchPromise;
        });
    });
});
//# sourceMappingURL=nodejsWatcher.integrationTest.js.map