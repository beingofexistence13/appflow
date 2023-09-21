/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "vs/base/common/async", "vs/base/common/network", "vs/base/common/path", "vs/base/node/pfs", "vs/base/node/zip", "vs/base/test/common/utils", "vs/base/test/node/testUtils"], function (require, exports, assert, os_1, async_1, network_1, path, pfs_1, zip_1, utils_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Zip', () => {
        (0, utils_1.$bT)();
        test('extract should handle directories', async () => {
            const testDir = (0, testUtils_1.$oT)((0, os_1.tmpdir)(), 'vsctests', 'zip');
            await pfs_1.Promises.mkdir(testDir, { recursive: true });
            const fixtures = network_1.$2f.asFileUri('vs/base/test/node/zip/fixtures').fsPath;
            const fixture = path.$9d(fixtures, 'extract.zip');
            await (0, async_1.$ug)(token => (0, zip_1.$dp)(fixture, testDir, {}, token));
            const doesExist = await pfs_1.Promises.exists(path.$9d(testDir, 'extension'));
            assert(doesExist);
            await pfs_1.Promises.rm(testDir);
        });
    });
});
//# sourceMappingURL=zip.test.js.map