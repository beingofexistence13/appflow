/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "os", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/extpath", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/node/pfs", "vs/base/test/common/utils", "vs/base/test/node/testUtils"], function (require, exports, assert, fs, os_1, async_1, buffer_1, extpath_1, network_1, path_1, platform_1, pfs_1, utils_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, pfs_1.configureFlushOnWrite)(false); // speed up all unit tests by disabling flush on write
    (0, testUtils_1.flakySuite)('PFS', function () {
        let testDir;
        setup(() => {
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'pfs');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return pfs_1.Promises.rm(testDir);
        });
        test('writeFile', async () => {
            const testFile = (0, path_1.join)(testDir, 'writefile.txt');
            assert.ok(!(await pfs_1.Promises.exists(testFile)));
            await pfs_1.Promises.writeFile(testFile, 'Hello World', (null));
            assert.strictEqual((await pfs_1.Promises.readFile(testFile)).toString(), 'Hello World');
        });
        test('writeFile - parallel write on different files works', async () => {
            const testFile1 = (0, path_1.join)(testDir, 'writefile1.txt');
            const testFile2 = (0, path_1.join)(testDir, 'writefile2.txt');
            const testFile3 = (0, path_1.join)(testDir, 'writefile3.txt');
            const testFile4 = (0, path_1.join)(testDir, 'writefile4.txt');
            const testFile5 = (0, path_1.join)(testDir, 'writefile5.txt');
            await Promise.all([
                pfs_1.Promises.writeFile(testFile1, 'Hello World 1', (null)),
                pfs_1.Promises.writeFile(testFile2, 'Hello World 2', (null)),
                pfs_1.Promises.writeFile(testFile3, 'Hello World 3', (null)),
                pfs_1.Promises.writeFile(testFile4, 'Hello World 4', (null)),
                pfs_1.Promises.writeFile(testFile5, 'Hello World 5', (null))
            ]);
            assert.strictEqual(fs.readFileSync(testFile1).toString(), 'Hello World 1');
            assert.strictEqual(fs.readFileSync(testFile2).toString(), 'Hello World 2');
            assert.strictEqual(fs.readFileSync(testFile3).toString(), 'Hello World 3');
            assert.strictEqual(fs.readFileSync(testFile4).toString(), 'Hello World 4');
            assert.strictEqual(fs.readFileSync(testFile5).toString(), 'Hello World 5');
        });
        test('writeFile - parallel write on same files works and is sequentalized', async () => {
            const testFile = (0, path_1.join)(testDir, 'writefile.txt');
            await Promise.all([
                pfs_1.Promises.writeFile(testFile, 'Hello World 1', undefined),
                pfs_1.Promises.writeFile(testFile, 'Hello World 2', undefined),
                (0, async_1.timeout)(10).then(() => pfs_1.Promises.writeFile(testFile, 'Hello World 3', undefined)),
                pfs_1.Promises.writeFile(testFile, 'Hello World 4', undefined),
                (0, async_1.timeout)(10).then(() => pfs_1.Promises.writeFile(testFile, 'Hello World 5', undefined))
            ]);
            assert.strictEqual(fs.readFileSync(testFile).toString(), 'Hello World 5');
        });
        test('rimraf - simple - unlink', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple - move', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple - move (with moveToPath)', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir, pfs_1.RimRafMode.MOVE, (0, path_1.join)((0, path_1.dirname)(testDir), `${(0, path_1.basename)(testDir)}.vsctmp`));
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - path does not exist - move', async () => {
            const nonExistingDir = (0, path_1.join)(testDir, 'unknown-move');
            await pfs_1.Promises.rm(nonExistingDir, pfs_1.RimRafMode.MOVE);
        });
        test('rimraf - path does not exist - unlink', async () => {
            const nonExistingDir = (0, path_1.join)(testDir, 'unknown-unlink');
            await pfs_1.Promises.rm(nonExistingDir, pfs_1.RimRafMode.UNLINK);
        });
        test('rimraf - recursive folder structure - unlink', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder'));
            fs.writeFileSync((0, path_1.join)(testDir, 'somefolder', 'somefile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - recursive folder structure - move', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder'));
            fs.writeFileSync((0, path_1.join)(testDir, 'somefolder', 'somefile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple ends with dot - move', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple ends with dot slash/backslash - move', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(`${testDir}${path_1.sep}`, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimrafSync - swallows file not found error', function () {
            const nonExistingDir = (0, path_1.join)(testDir, 'not-existing');
            (0, pfs_1.rimrafSync)(nonExistingDir);
            assert.ok(!fs.existsSync(nonExistingDir));
        });
        test('rimrafSync - simple', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            (0, pfs_1.rimrafSync)(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimrafSync - recursive folder structure', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder'));
            fs.writeFileSync((0, path_1.join)(testDir, 'somefolder', 'somefile.txt'), 'Contents');
            (0, pfs_1.rimrafSync)(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('copy, rename and delete', async () => {
            const sourceDir = network_1.FileAccess.asFileUri('vs/base/test/node/pfs/fixtures').fsPath;
            const parentDir = (0, path_1.join)((0, os_1.tmpdir)(), 'vsctests', 'pfs');
            const targetDir = (0, extpath_1.randomPath)(parentDir);
            const targetDir2 = (0, extpath_1.randomPath)(parentDir);
            await pfs_1.Promises.copy(sourceDir, targetDir, { preserveSymlinks: true });
            assert.ok(fs.existsSync(targetDir));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir, 'site.css')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir, 'examples')));
            assert.ok(fs.statSync((0, path_1.join)(targetDir, 'examples')).isDirectory());
            assert.ok(fs.existsSync((0, path_1.join)(targetDir, 'examples', 'small.jxs')));
            await pfs_1.Promises.rename(targetDir, targetDir2);
            assert.ok(!fs.existsSync(targetDir));
            assert.ok(fs.existsSync(targetDir2));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'site.css')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'examples')));
            assert.ok(fs.statSync((0, path_1.join)(targetDir2, 'examples')).isDirectory());
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'examples', 'small.jxs')));
            await pfs_1.Promises.rename((0, path_1.join)(targetDir2, 'index.html'), (0, path_1.join)(targetDir2, 'index_moved.html'));
            assert.ok(!fs.existsSync((0, path_1.join)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'index_moved.html')));
            await pfs_1.Promises.rm(parentDir);
            assert.ok(!fs.existsSync(parentDir));
        });
        test('rename without retry', async () => {
            const sourceDir = network_1.FileAccess.asFileUri('vs/base/test/node/pfs/fixtures').fsPath;
            const parentDir = (0, path_1.join)((0, os_1.tmpdir)(), 'vsctests', 'pfs');
            const targetDir = (0, extpath_1.randomPath)(parentDir);
            const targetDir2 = (0, extpath_1.randomPath)(parentDir);
            await pfs_1.Promises.copy(sourceDir, targetDir, { preserveSymlinks: true });
            await pfs_1.Promises.rename(targetDir, targetDir2, false);
            assert.ok(!fs.existsSync(targetDir));
            assert.ok(fs.existsSync(targetDir2));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'site.css')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'examples')));
            assert.ok(fs.statSync((0, path_1.join)(targetDir2, 'examples')).isDirectory());
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'examples', 'small.jxs')));
            await pfs_1.Promises.rename((0, path_1.join)(targetDir2, 'index.html'), (0, path_1.join)(targetDir2, 'index_moved.html'), false);
            assert.ok(!fs.existsSync((0, path_1.join)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'index_moved.html')));
            await pfs_1.Promises.rm(parentDir);
            assert.ok(!fs.existsSync(parentDir));
        });
        test('copy handles symbolic links', async () => {
            const symbolicLinkTarget = (0, extpath_1.randomPath)(testDir);
            const symLink = (0, extpath_1.randomPath)(testDir);
            const copyTarget = (0, extpath_1.randomPath)(testDir);
            await pfs_1.Promises.mkdir(symbolicLinkTarget, { recursive: true });
            fs.symlinkSync(symbolicLinkTarget, symLink, 'junction');
            // Copy preserves symlinks if configured as such
            //
            // Windows: this test does not work because creating symlinks
            // requires priviledged permissions (admin).
            if (!platform_1.isWindows) {
                await pfs_1.Promises.copy(symLink, copyTarget, { preserveSymlinks: true });
                assert.ok(fs.existsSync(copyTarget));
                const { symbolicLink } = await pfs_1.SymlinkSupport.stat(copyTarget);
                assert.ok(symbolicLink);
                assert.ok(!symbolicLink.dangling);
                const target = await pfs_1.Promises.readlink(copyTarget);
                assert.strictEqual(target, symbolicLinkTarget);
                // Copy does not preserve symlinks if configured as such
                await pfs_1.Promises.rm(copyTarget);
                await pfs_1.Promises.copy(symLink, copyTarget, { preserveSymlinks: false });
                assert.ok(fs.existsSync(copyTarget));
                const { symbolicLink: symbolicLink2 } = await pfs_1.SymlinkSupport.stat(copyTarget);
                assert.ok(!symbolicLink2);
            }
            // Copy does not fail over dangling symlinks
            await pfs_1.Promises.rm(copyTarget);
            await pfs_1.Promises.rm(symbolicLinkTarget);
            await pfs_1.Promises.copy(symLink, copyTarget, { preserveSymlinks: true }); // this should not throw
            if (!platform_1.isWindows) {
                const { symbolicLink } = await pfs_1.SymlinkSupport.stat(copyTarget);
                assert.ok(symbolicLink?.dangling);
            }
            else {
                assert.ok(!fs.existsSync(copyTarget));
            }
        });
        test('copy handles symbolic links when the reference is inside source', async () => {
            // Source Folder
            const sourceFolder = (0, path_1.join)((0, extpath_1.randomPath)(testDir), 'copy-test'); // copy-test
            const sourceLinkTestFolder = (0, path_1.join)(sourceFolder, 'link-test'); // copy-test/link-test
            const sourceLinkMD5JSFolder = (0, path_1.join)(sourceLinkTestFolder, 'md5'); // copy-test/link-test/md5
            const sourceLinkMD5JSFile = (0, path_1.join)(sourceLinkMD5JSFolder, 'md5.js'); // copy-test/link-test/md5/md5.js
            await pfs_1.Promises.mkdir(sourceLinkMD5JSFolder, { recursive: true });
            await pfs_1.Promises.writeFile(sourceLinkMD5JSFile, 'Hello from MD5');
            const sourceLinkMD5JSFolderLinked = (0, path_1.join)(sourceLinkTestFolder, 'md5-linked'); // copy-test/link-test/md5-linked
            fs.symlinkSync(sourceLinkMD5JSFolder, sourceLinkMD5JSFolderLinked, 'junction');
            // Target Folder
            const targetLinkTestFolder = (0, path_1.join)(sourceFolder, 'link-test copy'); // copy-test/link-test copy
            const targetLinkMD5JSFolder = (0, path_1.join)(targetLinkTestFolder, 'md5'); // copy-test/link-test copy/md5
            const targetLinkMD5JSFile = (0, path_1.join)(targetLinkMD5JSFolder, 'md5.js'); // copy-test/link-test copy/md5/md5.js
            const targetLinkMD5JSFolderLinked = (0, path_1.join)(targetLinkTestFolder, 'md5-linked'); // copy-test/link-test copy/md5-linked
            // Copy with `preserveSymlinks: true` and verify result
            //
            // Windows: this test does not work because creating symlinks
            // requires priviledged permissions (admin).
            if (!platform_1.isWindows) {
                await pfs_1.Promises.copy(sourceLinkTestFolder, targetLinkTestFolder, { preserveSymlinks: true });
                assert.ok(fs.existsSync(targetLinkTestFolder));
                assert.ok(fs.existsSync(targetLinkMD5JSFolder));
                assert.ok(fs.existsSync(targetLinkMD5JSFile));
                assert.ok(fs.existsSync(targetLinkMD5JSFolderLinked));
                assert.ok(fs.lstatSync(targetLinkMD5JSFolderLinked).isSymbolicLink());
                const linkTarget = await pfs_1.Promises.readlink(targetLinkMD5JSFolderLinked);
                assert.strictEqual(linkTarget, targetLinkMD5JSFolder);
                await pfs_1.Promises.rm(targetLinkTestFolder);
            }
            // Copy with `preserveSymlinks: false` and verify result
            await pfs_1.Promises.copy(sourceLinkTestFolder, targetLinkTestFolder, { preserveSymlinks: false });
            assert.ok(fs.existsSync(targetLinkTestFolder));
            assert.ok(fs.existsSync(targetLinkMD5JSFolder));
            assert.ok(fs.existsSync(targetLinkMD5JSFile));
            assert.ok(fs.existsSync(targetLinkMD5JSFolderLinked));
            assert.ok(fs.lstatSync(targetLinkMD5JSFolderLinked).isDirectory());
        });
        test('readDirsInDir', async () => {
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder1'));
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder2'));
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder3'));
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            const result = await pfs_1.Promises.readDirsInDir(testDir);
            assert.strictEqual(result.length, 3);
            assert.ok(result.indexOf('somefolder1') !== -1);
            assert.ok(result.indexOf('somefolder2') !== -1);
            assert.ok(result.indexOf('somefolder3') !== -1);
        });
        test('stat link', async () => {
            const directory = (0, extpath_1.randomPath)(testDir);
            const symbolicLink = (0, extpath_1.randomPath)(testDir);
            await pfs_1.Promises.mkdir(directory, { recursive: true });
            fs.symlinkSync(directory, symbolicLink, 'junction');
            let statAndIsLink = await pfs_1.SymlinkSupport.stat(directory);
            assert.ok(!statAndIsLink?.symbolicLink);
            statAndIsLink = await pfs_1.SymlinkSupport.stat(symbolicLink);
            assert.ok(statAndIsLink?.symbolicLink);
            assert.ok(!statAndIsLink?.symbolicLink?.dangling);
        });
        test('stat link (non existing target)', async () => {
            const directory = (0, extpath_1.randomPath)(testDir);
            const symbolicLink = (0, extpath_1.randomPath)(testDir);
            await pfs_1.Promises.mkdir(directory, { recursive: true });
            fs.symlinkSync(directory, symbolicLink, 'junction');
            await pfs_1.Promises.rm(directory);
            const statAndIsLink = await pfs_1.SymlinkSupport.stat(symbolicLink);
            assert.ok(statAndIsLink?.symbolicLink);
            assert.ok(statAndIsLink?.symbolicLink?.dangling);
        });
        test('readdir', async () => {
            if (typeof process.versions['electron'] !== 'undefined' /* needs electron */) {
                const parent = (0, extpath_1.randomPath)((0, path_1.join)(testDir, 'pfs'));
                const newDir = (0, path_1.join)(parent, 'öäü');
                await pfs_1.Promises.mkdir(newDir, { recursive: true });
                assert.ok(fs.existsSync(newDir));
                const children = await pfs_1.Promises.readdir(parent);
                assert.strictEqual(children.some(n => n === 'öäü'), true); // Mac always converts to NFD, so
            }
        });
        test('readdir (with file types)', async () => {
            if (typeof process.versions['electron'] !== 'undefined' /* needs electron */) {
                const newDir = (0, path_1.join)(testDir, 'öäü');
                await pfs_1.Promises.mkdir(newDir, { recursive: true });
                await pfs_1.Promises.writeFile((0, path_1.join)(testDir, 'somefile.txt'), 'contents');
                assert.ok(fs.existsSync(newDir));
                const children = await pfs_1.Promises.readdir(testDir, { withFileTypes: true });
                assert.strictEqual(children.some(n => n.name === 'öäü'), true); // Mac always converts to NFD, so
                assert.strictEqual(children.some(n => n.isDirectory()), true);
                assert.strictEqual(children.some(n => n.name === 'somefile.txt'), true);
                assert.strictEqual(children.some(n => n.isFile()), true);
            }
        });
        test('writeFile (string)', async () => {
            const smallData = 'Hello World';
            const bigData = (new Array(100 * 1024)).join('Large String\n');
            return testWriteFile(smallData, smallData, bigData, bigData);
        });
        test('writeFile (string) - flush on write', async () => {
            (0, pfs_1.configureFlushOnWrite)(true);
            try {
                const smallData = 'Hello World';
                const bigData = (new Array(100 * 1024)).join('Large String\n');
                return await testWriteFile(smallData, smallData, bigData, bigData);
            }
            finally {
                (0, pfs_1.configureFlushOnWrite)(false);
            }
        });
        test('writeFile (Buffer)', async () => {
            const smallData = 'Hello World';
            const bigData = (new Array(100 * 1024)).join('Large String\n');
            return testWriteFile(Buffer.from(smallData), smallData, Buffer.from(bigData), bigData);
        });
        test('writeFile (UInt8Array)', async () => {
            const smallData = 'Hello World';
            const bigData = (new Array(100 * 1024)).join('Large String\n');
            return testWriteFile(buffer_1.VSBuffer.fromString(smallData).buffer, smallData, buffer_1.VSBuffer.fromString(bigData).buffer, bigData);
        });
        async function testWriteFile(smallData, smallDataValue, bigData, bigDataValue) {
            const testFile = (0, path_1.join)(testDir, 'flushed.txt');
            assert.ok(fs.existsSync(testDir));
            await pfs_1.Promises.writeFile(testFile, smallData);
            assert.strictEqual(fs.readFileSync(testFile).toString(), smallDataValue);
            await pfs_1.Promises.writeFile(testFile, bigData);
            assert.strictEqual(fs.readFileSync(testFile).toString(), bigDataValue);
        }
        test('writeFile (string, error handling)', async () => {
            const testFile = (0, path_1.join)(testDir, 'flushed.txt');
            fs.mkdirSync(testFile); // this will trigger an error later because testFile is now a directory!
            let expectedError;
            try {
                await pfs_1.Promises.writeFile(testFile, 'Hello World');
            }
            catch (error) {
                expectedError = error;
            }
            assert.ok(expectedError);
        });
        test('writeFileSync', async () => {
            const testFile = (0, path_1.join)(testDir, 'flushed.txt');
            (0, pfs_1.writeFileSync)(testFile, 'Hello World');
            assert.strictEqual(fs.readFileSync(testFile).toString(), 'Hello World');
            const largeString = (new Array(100 * 1024)).join('Large String\n');
            (0, pfs_1.writeFileSync)(testFile, largeString);
            assert.strictEqual(fs.readFileSync(testFile).toString(), largeString);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGZzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3Qvbm9kZS9wZnMvcGZzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFlaEcsSUFBQSwyQkFBcUIsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLHNEQUFzRDtJQUVwRixJQUFBLHNCQUFVLEVBQUMsS0FBSyxFQUFFO1FBRWpCLElBQUksT0FBZSxDQUFDO1FBRXBCLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixPQUFPLEdBQUcsSUFBQSw2QkFBaUIsRUFBQyxJQUFBLFdBQU0sR0FBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV6RCxPQUFPLGNBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsT0FBTyxjQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksRUFBRTtZQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFBLFdBQUksRUFBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFFaEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxjQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5QyxNQUFNLGNBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUssQ0FBQyxDQUFDLENBQUM7WUFFM0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sY0FBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ25GLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFEQUFxRCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3RFLE1BQU0sU0FBUyxHQUFHLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sU0FBUyxHQUFHLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sU0FBUyxHQUFHLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sU0FBUyxHQUFHLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sU0FBUyxHQUFHLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBRWxELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDakIsY0FBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLENBQUMsSUFBSyxDQUFDLENBQUM7Z0JBQ3ZELGNBQVEsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFBRSxDQUFDLElBQUssQ0FBQyxDQUFDO2dCQUN2RCxjQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxJQUFLLENBQUMsQ0FBQztnQkFDdkQsY0FBUSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLENBQUMsSUFBSyxDQUFDLENBQUM7Z0JBQ3ZELGNBQVEsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFBRSxDQUFDLElBQUssQ0FBQyxDQUFDO2FBQ3ZELENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUVBQXFFLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdEYsTUFBTSxRQUFRLEdBQUcsSUFBQSxXQUFJLEVBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBRWhELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDakIsY0FBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLFNBQVMsQ0FBQztnQkFDeEQsY0FBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLFNBQVMsQ0FBQztnQkFDeEQsSUFBQSxlQUFPLEVBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDaEYsY0FBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLFNBQVMsQ0FBQztnQkFDeEQsSUFBQSxlQUFPLEVBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxTQUFTLENBQUMs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VSxDQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5FLE1BQU0sY0FBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFN0MsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBQSxXQUFJLEVBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBQSxXQUFJLEVBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBQSxXQUFJLEVBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBQSxXQUFJLEVBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUNuRSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBQSxXQUFJLEVBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFcEUsTUFBTSxjQUFRLENBQUMsTUFBTSxDQUFDLElBQUEsV0FBSSxFQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsRUFBRSxJQUFBLFdBQUksRUFBQyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBRTVGLE1BQU0sQ0FBQyxF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