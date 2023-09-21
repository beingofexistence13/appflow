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
            testDir = (0, testUtils_1.$oT)((0, os_1.tmpdir)(), 'vsctests', 'pfs');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return pfs_1.Promises.rm(testDir);
        });
        test('writeFile', async () => {
            const testFile = (0, path_1.$9d)(testDir, 'writefile.txt');
            assert.ok(!(await pfs_1.Promises.exists(testFile)));
            await pfs_1.Promises.writeFile(testFile, 'Hello World', (null));
            assert.strictEqual((await pfs_1.Promises.readFile(testFile)).toString(), 'Hello World');
        });
        test('writeFile - parallel write on different files works', async () => {
            const testFile1 = (0, path_1.$9d)(testDir, 'writefile1.txt');
            const testFile2 = (0, path_1.$9d)(testDir, 'writefile2.txt');
            const testFile3 = (0, path_1.$9d)(testDir, 'writefile3.txt');
            const testFile4 = (0, path_1.$9d)(testDir, 'writefile4.txt');
            const testFile5 = (0, path_1.$9d)(testDir, 'writefile5.txt');
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
            const testFile = (0, path_1.$9d)(testDir, 'writefile.txt');
            await Promise.all([
                pfs_1.Promises.writeFile(testFile, 'Hello World 1', undefined),
                pfs_1.Promises.writeFile(testFile, 'Hello World 2', undefined),
                (0, async_1.$Hg)(10).then(() => pfs_1.Promises.writeFile(testFile, 'Hello World 3', undefined)),
                pfs_1.Promises.writeFile(testFile, 'Hello World 4', undefined),
                (0, async_1.$Hg)(10).then(() => pfs_1.Promises.writeFile(testFile, 'Hello World 5', undefined))
            ]);
            assert.strictEqual(fs.readFileSync(testFile).toString(), 'Hello World 5');
        });
        test('rimraf - simple - unlink', async () => {
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple - move', async () => {
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple - move (with moveToPath)', async () => {
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir, pfs_1.RimRafMode.MOVE, (0, path_1.$9d)((0, path_1.$_d)(testDir), `${(0, path_1.$ae)(testDir)}.vsctmp`));
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - path does not exist - move', async () => {
            const nonExistingDir = (0, path_1.$9d)(testDir, 'unknown-move');
            await pfs_1.Promises.rm(nonExistingDir, pfs_1.RimRafMode.MOVE);
        });
        test('rimraf - path does not exist - unlink', async () => {
            const nonExistingDir = (0, path_1.$9d)(testDir, 'unknown-unlink');
            await pfs_1.Promises.rm(nonExistingDir, pfs_1.RimRafMode.UNLINK);
        });
        test('rimraf - recursive folder structure - unlink', async () => {
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            fs.mkdirSync((0, path_1.$9d)(testDir, 'somefolder'));
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefolder', 'somefile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - recursive folder structure - move', async () => {
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            fs.mkdirSync((0, path_1.$9d)(testDir, 'somefolder'));
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefolder', 'somefile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple ends with dot - move', async () => {
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(testDir, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple ends with dot slash/backslash - move', async () => {
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            await pfs_1.Promises.rm(`${testDir}${path_1.sep}`, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimrafSync - swallows file not found error', function () {
            const nonExistingDir = (0, path_1.$9d)(testDir, 'not-existing');
            (0, pfs_1.rimrafSync)(nonExistingDir);
            assert.ok(!fs.existsSync(nonExistingDir));
        });
        test('rimrafSync - simple', async () => {
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            (0, pfs_1.rimrafSync)(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimrafSync - recursive folder structure', async () => {
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            fs.mkdirSync((0, path_1.$9d)(testDir, 'somefolder'));
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefolder', 'somefile.txt'), 'Contents');
            (0, pfs_1.rimrafSync)(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('copy, rename and delete', async () => {
            const sourceDir = network_1.$2f.asFileUri('vs/base/test/node/pfs/fixtures').fsPath;
            const parentDir = (0, path_1.$9d)((0, os_1.tmpdir)(), 'vsctests', 'pfs');
            const targetDir = (0, extpath_1.$Qf)(parentDir);
            const targetDir2 = (0, extpath_1.$Qf)(parentDir);
            await pfs_1.Promises.copy(sourceDir, targetDir, { preserveSymlinks: true });
            assert.ok(fs.existsSync(targetDir));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir, 'site.css')));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir, 'examples')));
            assert.ok(fs.statSync((0, path_1.$9d)(targetDir, 'examples')).isDirectory());
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir, 'examples', 'small.jxs')));
            await pfs_1.Promises.rename(targetDir, targetDir2);
            assert.ok(!fs.existsSync(targetDir));
            assert.ok(fs.existsSync(targetDir2));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'site.css')));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'examples')));
            assert.ok(fs.statSync((0, path_1.$9d)(targetDir2, 'examples')).isDirectory());
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'examples', 'small.jxs')));
            await pfs_1.Promises.rename((0, path_1.$9d)(targetDir2, 'index.html'), (0, path_1.$9d)(targetDir2, 'index_moved.html'));
            assert.ok(!fs.existsSync((0, path_1.$9d)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'index_moved.html')));
            await pfs_1.Promises.rm(parentDir);
            assert.ok(!fs.existsSync(parentDir));
        });
        test('rename without retry', async () => {
            const sourceDir = network_1.$2f.asFileUri('vs/base/test/node/pfs/fixtures').fsPath;
            const parentDir = (0, path_1.$9d)((0, os_1.tmpdir)(), 'vsctests', 'pfs');
            const targetDir = (0, extpath_1.$Qf)(parentDir);
            const targetDir2 = (0, extpath_1.$Qf)(parentDir);
            await pfs_1.Promises.copy(sourceDir, targetDir, { preserveSymlinks: true });
            await pfs_1.Promises.rename(targetDir, targetDir2, false);
            assert.ok(!fs.existsSync(targetDir));
            assert.ok(fs.existsSync(targetDir2));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'site.css')));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'examples')));
            assert.ok(fs.statSync((0, path_1.$9d)(targetDir2, 'examples')).isDirectory());
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'examples', 'small.jxs')));
            await pfs_1.Promises.rename((0, path_1.$9d)(targetDir2, 'index.html'), (0, path_1.$9d)(targetDir2, 'index_moved.html'), false);
            assert.ok(!fs.existsSync((0, path_1.$9d)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.$9d)(targetDir2, 'index_moved.html')));
            await pfs_1.Promises.rm(parentDir);
            assert.ok(!fs.existsSync(parentDir));
        });
        test('copy handles symbolic links', async () => {
            const symbolicLinkTarget = (0, extpath_1.$Qf)(testDir);
            const symLink = (0, extpath_1.$Qf)(testDir);
            const copyTarget = (0, extpath_1.$Qf)(testDir);
            await pfs_1.Promises.mkdir(symbolicLinkTarget, { recursive: true });
            fs.symlinkSync(symbolicLinkTarget, symLink, 'junction');
            // Copy preserves symlinks if configured as such
            //
            // Windows: this test does not work because creating symlinks
            // requires priviledged permissions (admin).
            if (!platform_1.$i) {
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
            if (!platform_1.$i) {
                const { symbolicLink } = await pfs_1.SymlinkSupport.stat(copyTarget);
                assert.ok(symbolicLink?.dangling);
            }
            else {
                assert.ok(!fs.existsSync(copyTarget));
            }
        });
        test('copy handles symbolic links when the reference is inside source', async () => {
            // Source Folder
            const sourceFolder = (0, path_1.$9d)((0, extpath_1.$Qf)(testDir), 'copy-test'); // copy-test
            const sourceLinkTestFolder = (0, path_1.$9d)(sourceFolder, 'link-test'); // copy-test/link-test
            const sourceLinkMD5JSFolder = (0, path_1.$9d)(sourceLinkTestFolder, 'md5'); // copy-test/link-test/md5
            const sourceLinkMD5JSFile = (0, path_1.$9d)(sourceLinkMD5JSFolder, 'md5.js'); // copy-test/link-test/md5/md5.js
            await pfs_1.Promises.mkdir(sourceLinkMD5JSFolder, { recursive: true });
            await pfs_1.Promises.writeFile(sourceLinkMD5JSFile, 'Hello from MD5');
            const sourceLinkMD5JSFolderLinked = (0, path_1.$9d)(sourceLinkTestFolder, 'md5-linked'); // copy-test/link-test/md5-linked
            fs.symlinkSync(sourceLinkMD5JSFolder, sourceLinkMD5JSFolderLinked, 'junction');
            // Target Folder
            const targetLinkTestFolder = (0, path_1.$9d)(sourceFolder, 'link-test copy'); // copy-test/link-test copy
            const targetLinkMD5JSFolder = (0, path_1.$9d)(targetLinkTestFolder, 'md5'); // copy-test/link-test copy/md5
            const targetLinkMD5JSFile = (0, path_1.$9d)(targetLinkMD5JSFolder, 'md5.js'); // copy-test/link-test copy/md5/md5.js
            const targetLinkMD5JSFolderLinked = (0, path_1.$9d)(targetLinkTestFolder, 'md5-linked'); // copy-test/link-test copy/md5-linked
            // Copy with `preserveSymlinks: true` and verify result
            //
            // Windows: this test does not work because creating symlinks
            // requires priviledged permissions (admin).
            if (!platform_1.$i) {
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
            fs.mkdirSync((0, path_1.$9d)(testDir, 'somefolder1'));
            fs.mkdirSync((0, path_1.$9d)(testDir, 'somefolder2'));
            fs.mkdirSync((0, path_1.$9d)(testDir, 'somefolder3'));
            fs.writeFileSync((0, path_1.$9d)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.$9d)(testDir, 'someOtherFile.txt'), 'Contents');
            const result = await pfs_1.Promises.readDirsInDir(testDir);
            assert.strictEqual(result.length, 3);
            assert.ok(result.indexOf('somefolder1') !== -1);
            assert.ok(result.indexOf('somefolder2') !== -1);
            assert.ok(result.indexOf('somefolder3') !== -1);
        });
        test('stat link', async () => {
            const directory = (0, extpath_1.$Qf)(testDir);
            const symbolicLink = (0, extpath_1.$Qf)(testDir);
            await pfs_1.Promises.mkdir(directory, { recursive: true });
            fs.symlinkSync(directory, symbolicLink, 'junction');
            let statAndIsLink = await pfs_1.SymlinkSupport.stat(directory);
            assert.ok(!statAndIsLink?.symbolicLink);
            statAndIsLink = await pfs_1.SymlinkSupport.stat(symbolicLink);
            assert.ok(statAndIsLink?.symbolicLink);
            assert.ok(!statAndIsLink?.symbolicLink?.dangling);
        });
        test('stat link (non existing target)', async () => {
            const directory = (0, extpath_1.$Qf)(testDir);
            const symbolicLink = (0, extpath_1.$Qf)(testDir);
            await pfs_1.Promises.mkdir(directory, { recursive: true });
            fs.symlinkSync(directory, symbolicLink, 'junction');
            await pfs_1.Promises.rm(directory);
            const statAndIsLink = await pfs_1.SymlinkSupport.stat(symbolicLink);
            assert.ok(statAndIsLink?.symbolicLink);
            assert.ok(statAndIsLink?.symbolicLink?.dangling);
        });
        test('readdir', async () => {
            if (typeof process.versions['electron'] !== 'undefined' /* needs electron */) {
                const parent = (0, extpath_1.$Qf)((0, path_1.$9d)(testDir, 'pfs'));
                const newDir = (0, path_1.$9d)(parent, 'öäü');
                await pfs_1.Promises.mkdir(newDir, { recursive: true });
                assert.ok(fs.existsSync(newDir));
                const children = await pfs_1.Promises.readdir(parent);
                assert.strictEqual(children.some(n => n === 'öäü'), true); // Mac always converts to NFD, so
            }
        });
        test('readdir (with file types)', async () => {
            if (typeof process.versions['electron'] !== 'undefined' /* needs electron */) {
                const newDir = (0, path_1.$9d)(testDir, 'öäü');
                await pfs_1.Promises.mkdir(newDir, { recursive: true });
                await pfs_1.Promises.writeFile((0, path_1.$9d)(testDir, 'somefile.txt'), 'contents');
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
            return testWriteFile(buffer_1.$Fd.fromString(smallData).buffer, smallData, buffer_1.$Fd.fromString(bigData).buffer, bigData);
        });
        async function testWriteFile(smallData, smallDataValue, bigData, bigDataValue) {
            const testFile = (0, path_1.$9d)(testDir, 'flushed.txt');
            assert.ok(fs.existsSync(testDir));
            await pfs_1.Promises.writeFile(testFile, smallData);
            assert.strictEqual(fs.readFileSync(testFile).toString(), smallDataValue);
            await pfs_1.Promises.writeFile(testFile, bigData);
            assert.strictEqual(fs.readFileSync(testFile).toString(), bigDataValue);
        }
        test('writeFile (string, error handling)', async () => {
            const testFile = (0, path_1.$9d)(testDir, 'flushed.txt');
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
            const testFile = (0, path_1.$9d)(testDir, 'flushed.txt');
            (0, pfs_1.writeFileSync)(testFile, 'Hello World');
            assert.strictEqual(fs.readFileSync(testFile).toString(), 'Hello World');
            const largeString = (new Array(100 * 1024)).join('Large String\n');
            (0, pfs_1.writeFileSync)(testFile, largeString);
            assert.strictEqual(fs.readFileSync(testFile).toString(), largeString);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=pfs.test.js.map