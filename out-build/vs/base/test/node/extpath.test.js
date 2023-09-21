/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "vs/base/node/extpath", "vs/base/node/pfs", "vs/base/test/common/utils", "vs/base/test/node/testUtils"], function (require, exports, assert, os_1, extpath_1, pfs_1, utils_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('Extpath', () => {
        let testDir;
        setup(() => {
            testDir = (0, testUtils_1.$oT)((0, os_1.tmpdir)(), 'vsctests', 'extpath');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return pfs_1.Promises.rm(testDir);
        });
        test('realcaseSync', async () => {
            // assume case insensitive file system
            if (process.platform === 'win32' || process.platform === 'darwin') {
                const upper = testDir.toUpperCase();
                const real = (0, extpath_1.$Up)(upper);
                if (real) { // can be null in case of permission errors
                    assert.notStrictEqual(real, upper);
                    assert.strictEqual(real.toUpperCase(), upper);
                    assert.strictEqual(real, testDir);
                }
            }
            // linux, unix, etc. -> assume case sensitive file system
            else {
                let real = (0, extpath_1.$Up)(testDir);
                assert.strictEqual(real, testDir);
                real = (0, extpath_1.$Up)(testDir.toUpperCase());
                assert.strictEqual(real, testDir.toUpperCase());
            }
        });
        test('realcase', async () => {
            // assume case insensitive file system
            if (process.platform === 'win32' || process.platform === 'darwin') {
                const upper = testDir.toUpperCase();
                const real = await (0, extpath_1.$Vp)(upper);
                if (real) { // can be null in case of permission errors
                    assert.notStrictEqual(real, upper);
                    assert.strictEqual(real.toUpperCase(), upper);
                    assert.strictEqual(real, testDir);
                }
            }
            // linux, unix, etc. -> assume case sensitive file system
            else {
                let real = await (0, extpath_1.$Vp)(testDir);
                assert.strictEqual(real, testDir);
                real = await (0, extpath_1.$Vp)(testDir.toUpperCase());
                assert.strictEqual(real, testDir.toUpperCase());
            }
        });
        test('realpath', async () => {
            const realpathVal = await (0, extpath_1.$Wp)(testDir);
            assert.ok(realpathVal);
        });
        test('realpathSync', () => {
            const realpath = (0, extpath_1.$Xp)(testDir);
            assert.ok(realpath);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=extpath.test.js.map