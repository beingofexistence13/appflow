/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/path", "vs/base/node/crypto", "vs/base/node/pfs", "vs/base/test/node/testUtils"], function (require, exports, os_1, path_1, crypto_1, pfs_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('Crypto', () => {
        let testDir;
        setup(function () {
            testDir = (0, testUtils_1.$oT)((0, os_1.tmpdir)(), 'vsctests', 'crypto');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(function () {
            return pfs_1.Promises.rm(testDir);
        });
        test('checksum', async () => {
            const testFile = (0, path_1.$9d)(testDir, 'checksum.txt');
            await pfs_1.Promises.writeFile(testFile, 'Hello World');
            await (0, crypto_1.$PS)(testFile, '0a4d55a8d778e5022fab701977c5d840bbc486d0');
        });
    });
});
//# sourceMappingURL=crypto.test.js.map