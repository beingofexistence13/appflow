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
        class TestNodeJSWatcher extends nodejsWatcher_1.NodeJSWatcher {
            async watch(requests) {
                await super.watch(requests);
                await this.whenReady();
            }
            async whenReady() {
                for (const [, watcher] of this.watchers) {
                    await watcher.instance.ready;
                }
            }
        }
        class TestNodeJSFileWatcherLibrary extends nodejsWatcherLib_1.NodeJSFileWatcherLibrary {
            constructor() {
                super(...arguments);
                this._whenDisposed = new async_1.DeferredPromise();
                this.whenDisposed = this._whenDisposed.p;
            }
            dispose() {
                super.dispose();
                this._whenDisposed.complete();
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
            const newFilePath = (0, path_1.join)(testDir, 'newFile.txt');
            let changeFuture = awaitEvent(watcher, newFilePath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.writeFile(newFilePath, 'Hello World');
            await changeFuture;
            // New folder
            const newFolderPath = (0, path_1.join)(testDir, 'New Folder');
            changeFuture = awaitEvent(watcher, newFolderPath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.mkdir(newFolderPath);
            await changeFuture;
            // Rename file
            let renamedFilePath = (0, path_1.join)(testDir, 'renamedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, newFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, renamedFilePath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(newFilePath, renamedFilePath);
            await changeFuture;
            // Rename folder
            let renamedFolderPath = (0, path_1.join)(testDir, 'Renamed Folder');
            changeFuture = Promise.all([
                awaitEvent(watcher, newFolderPath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, renamedFolderPath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(newFolderPath, renamedFolderPath);
            await changeFuture;
            // Rename file (same name, different case)
            const caseRenamedFilePath = (0, path_1.join)(testDir, 'RenamedFile.txt');
            changeFuture = Promise.all([
                awaitEvent(watcher, renamedFilePath, 2 /* FileChangeType.DELETED */),
                awaitEvent(watcher, caseRenamedFilePath, 1 /* FileChangeType.ADDED */)
            ]);
            await pfs_1.Promises.rename(renamedFilePath, caseRenamedFilePath);
            await changeFuture;
            renamedFilePath = caseRenamedFilePath;
            // Rename folder (same name, different case)
            const caseRenamedFolderPath = (0, path_1.join)(testDir, 'REnamed Folder');
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
            const copiedFilepath = (0, path_1.join)(testDir, 'copiedFile.txt');
            changeFuture = awaitEvent(watcher, copiedFilepath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copyFile(movedFilepath, copiedFilepath);
            await changeFuture;
            // Copy folder
            const copiedFolderpath = (0, path_1.join)(testDir, 'Copied Folder');
            changeFuture = awaitEvent(watcher, copiedFolderpath, 1 /* FileChangeType.ADDED */);
            await pfs_1.Promises.copy(movedFolderpath, copiedFolderpath, { preserveSymlinks: false });
            await changeFuture;
            // Change file
            changeFuture = awaitEvent(watcher, copiedFilepath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.writeFile(copiedFilepath, 'Hello Change');
            await changeFuture;
            // Create new file
            const anotherNewFilePath = (0, path_1.join)(testDir, 'anotherNewFile.txt');
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
            const filePath = (0, path_1.join)(testDir, 'lorem.txt');
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
            const newFilePath = (0, path_1.join)(testDir, 'lorem.txt');
            const changeFuture = awaitEvent(watcher, newFilePath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.unlink(newFilePath);
            pfs_1.Promises.writeFile(newFilePath, 'Hello Atomic World');
            await changeFuture;
        });
        test('atomic writes (file watch)', async function () {
            const filePath = (0, path_1.join)(testDir, 'lorem.txt');
            await watcher.watch([{ path: filePath, excludes: [], recursive: false }]);
            // Delete + Recreate file
            const newFilePath = (0, path_1.join)(filePath);
            const changeFuture = awaitEvent(watcher, newFilePath, 0 /* FileChangeType.UPDATED */);
            await pfs_1.Promises.unlink(newFilePath);
            pfs_1.Promises.writeFile(newFilePath, 'Hello Atomic World');
            await changeFuture;
        });
        test('multiple events (folder watch)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], recursive: false }]);
            // multiple add
            const newFilePath1 = (0, path_1.join)(testDir, 'newFile-1.txt');
            const newFilePath2 = (0, path_1.join)(testDir, 'newFile-2.txt');
            const newFilePath3 = (0, path_1.join)(testDir, 'newFile-3.txt');
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
            const copyFuture1 = awaitEvent(watcher, (0, path_1.join)(testDir, 'newFile-1-copy.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture2 = awaitEvent(watcher, (0, path_1.join)(testDir, 'newFile-2-copy.txt'), 1 /* FileChangeType.ADDED */);
            const copyFuture3 = awaitEvent(watcher, (0, path_1.join)(testDir, 'newFile-3-copy.txt'), 1 /* FileChangeType.ADDED */);
            await Promise.all([
                pfs_1.Promises.copy((0, path_1.join)(testDir, 'newFile-1.txt'), (0, path_1.join)(testDir, 'newFile-1-copy.txt'), { preserveSymlinks: false }),
                pfs_1.Promises.copy((0, path_1.join)(testDir, 'newFile-2.txt'), (0, path_1.join)(testDir, 'newFile-2-copy.txt'), { preserveSymlinks: false }),
                pfs_1.Promises.copy((0, path_1.join)(testDir, 'newFile-3.txt'), (0, path_1.join)(testDir, 'newFile-3-copy.txt'), { preserveSymlinks: false })
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
            const filePath = (0, path_1.join)(testDir, 'lorem.txt');
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
            return basicCrudTest((0, path_1.join)(testDir, 'files-excludes.txt'));
        });
        test('excludes are ignored (file watch)', async function () {
            const filePath = (0, path_1.join)(testDir, 'lorem.txt');
            await watcher.watch([{ path: filePath, excludes: ['**'], recursive: false }]);
            return basicCrudTest(filePath, true);
        });
        test('includes can be updated (folder watch)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['nothing'], recursive: false }]);
            await watcher.watch([{ path: testDir, excludes: [], recursive: false }]);
            return basicCrudTest((0, path_1.join)(testDir, 'files-includes.txt'));
        });
        test('non-includes are ignored (file watch)', async function () {
            const filePath = (0, path_1.join)(testDir, 'lorem.txt');
            await watcher.watch([{ path: filePath, excludes: [], includes: ['nothing'], recursive: false }]);
            return basicCrudTest(filePath, true);
        });
        test('includes are supported (folder watch)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['**/files-includes.txt'], recursive: false }]);
            return basicCrudTest((0, path_1.join)(testDir, 'files-includes.txt'));
        });
        test('includes are supported (folder watch, relative pattern explicit)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: [{ base: testDir, pattern: 'files-includes.txt' }], recursive: false }]);
            return basicCrudTest((0, path_1.join)(testDir, 'files-includes.txt'));
        });
        test('includes are supported (folder watch, relative pattern implicit)', async function () {
            await watcher.watch([{ path: testDir, excludes: [], includes: ['files-includes.txt'], recursive: false }]);
            return basicCrudTest((0, path_1.join)(testDir, 'files-includes.txt'));
        });
        (platform_1.isWindows /* windows: cannot create file symbolic link without elevated context */ ? test.skip : test)('symlink support (folder watch)', async function () {
            const link = (0, path_1.join)(testDir, 'deep-linked');
            const linkTarget = (0, path_1.join)(testDir, 'deep');
            await pfs_1.Promises.symlink(linkTarget, link);
            await watcher.watch([{ path: link, excludes: [], recursive: false }]);
            return basicCrudTest((0, path_1.join)(link, 'newFile.txt'));
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
        (platform_1.isWindows /* windows: cannot create file symbolic link without elevated context */ ? test.skip : test)('symlink support (file watch)', async function () {
            const link = (0, path_1.join)(testDir, 'lorem.txt-linked');
            const linkTarget = (0, path_1.join)(testDir, 'lorem.txt');
            await pfs_1.Promises.symlink(linkTarget, link);
            await watcher.watch([{ path: link, excludes: [], recursive: false }]);
            return basicCrudTest(link, true);
        });
        (!platform_1.isWindows /* UNC is windows only */ ? test.skip : test)('unc support (folder watch)', async function () {
            // Local UNC paths are in the form of: \\localhost\c$\my_dir
            const uncPath = `\\\\localhost\\${(0, extpath_1.getDriveLetter)(testDir)?.toLowerCase()}$\\${(0, strings_1.ltrim)(testDir.substr(testDir.indexOf(':') + 1), '\\')}`;
            await watcher.watch([{ path: uncPath, excludes: [], recursive: false }]);
            return basicCrudTest((0, path_1.join)(uncPath, 'newFile.txt'));
        });
        (!platform_1.isWindows /* UNC is windows only */ ? test.skip : test)('unc support (file watch)', async function () {
            // Local UNC paths are in the form of: \\localhost\c$\my_dir
            const uncPath = `\\\\localhost\\${(0, extpath_1.getDriveLetter)(testDir)?.toLowerCase()}$\\${(0, strings_1.ltrim)(testDir.substr(testDir.indexOf(':') + 1), '\\')}\\lorem.txt`;
            await watcher.watch([{ path: uncPath, excludes: [], recursive: false }]);
            return basicCrudTest(uncPath, true);
        });
        (platform_1.isLinux /* linux: is case sensitive */ ? test.skip : test)('wrong casing (folder watch)', async function () {
            const wrongCase = (0, path_1.join)((0, path_1.dirname)(testDir), (0, path_1.basename)(testDir).toUpperCase());
            await watcher.watch([{ path: wrongCase, excludes: [], recursive: false }]);
            return basicCrudTest((0, path_1.join)(wrongCase, 'newFile.txt'));
        });
        (platform_1.isLinux /* linux: is case sensitive */ ? test.skip : test)('wrong casing (file watch)', async function () {
            const filePath = (0, path_1.join)(testDir, 'LOREM.txt');
            await watcher.watch([{ path: filePath, excludes: [], recursive: false }]);
            return basicCrudTest(filePath, true);
        });
        test('invalid path does not explode', async function () {
            const invalidPath = (0, path_1.join)(testDir, 'invalid');
            await watcher.watch([{ path: invalidPath, excludes: [], recursive: false }]);
        });
        (platform_1.isMacintosh /* macOS: does not seem to report this */ ? test.skip : test)('deleting watched path is handled properly (folder watch)', async function () {
            const watchedPath = (0, path_1.join)(testDir, 'deep');
            const watcher = new TestNodeJSFileWatcherLibrary({ path: watchedPath, excludes: [], recursive: false }, changes => { });
            await watcher.ready;
            // Delete watched path and ensure watcher is now disposed
            pfs_1.Promises.rm(watchedPath, pfs_1.RimRafMode.UNLINK);
            await watcher.whenDisposed;
        });
        test('deleting watched path is handled properly (file watch)', async function () {
            const watchedPath = (0, path_1.join)(testDir, 'lorem.txt');
            const watcher = new TestNodeJSFileWatcherLibrary({ path: watchedPath, excludes: [], recursive: false }, changes => { });
            await watcher.ready;
            // Delete watched path and ensure watcher is now disposed
            pfs_1.Promises.unlink(watchedPath);
            await watcher.whenDisposed;
        });
        test('watchFileContents', async function () {
            const watchedPath = (0, path_1.join)(testDir, 'lorem.txt');
            const cts = new cancellation_1.CancellationTokenSource();
            const readyPromise = new async_1.DeferredPromise();
            const chunkPromise = new async_1.DeferredPromise();
            const watchPromise = (0, nodejsWatcherLib_1.watchFileContents)(watchedPath, () => chunkPromise.complete(), () => readyPromise.complete(), cts.token);
            await readyPromise.p;
            pfs_1.Promises.writeFile(watchedPath, 'Hello World');
            await chunkPromise.p;
            cts.cancel(); // this will resolve `watchPromise`
            return watchPromise;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZWpzV2F0Y2hlci5pbnRlZ3JhdGlvblRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9maWxlcy90ZXN0L25vZGUvbm9kZWpzV2F0Y2hlci5pbnRlZ3JhdGlvblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFpQmhHLDJEQUEyRDtJQUMzRCwwREFBMEQ7SUFDMUQsNkRBQTZEO0lBQzdELDBDQUEwQztJQUUxQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsc0JBQVUsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtRQUVwSCxNQUFNLGlCQUFrQixTQUFRLDZCQUFhO1lBRW5DLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBcUM7Z0JBQ3pELE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDeEIsQ0FBQztZQUVELEtBQUssQ0FBQyxTQUFTO2dCQUNkLEtBQUssTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDeEMsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztpQkFDN0I7WUFDRixDQUFDO1NBQ0Q7UUFFRCxNQUFNLDRCQUE2QixTQUFRLDJDQUF3QjtZQUFuRTs7Z0JBRWtCLGtCQUFhLEdBQUcsSUFBSSx1QkFBZSxFQUFRLENBQUM7Z0JBQ3BELGlCQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFPOUMsQ0FBQztZQUxTLE9BQU87Z0JBQ2YsS0FBSyxDQUFD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