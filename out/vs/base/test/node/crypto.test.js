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
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'crypto');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(function () {
            return pfs_1.Promises.rm(testDir);
        });
        test('checksum', async () => {
            const testFile = (0, path_1.join)(testDir, 'checksum.txt');
            await pfs_1.Promises.writeFile(testFile, 'Hello World');
            await (0, crypto_1.checksum)(testFile, '0a4d55a8d778e5022fab701977c5d840bbc486d0');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3Qvbm9kZS9jcnlwdG8udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVFoRyxJQUFBLHNCQUFVLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtRQUV6QixJQUFJLE9BQWUsQ0FBQztRQUVwQixLQUFLLENBQUM7WUFDTCxPQUFPLEdBQUcsSUFBQSw2QkFBaUIsRUFBQyxJQUFBLFdBQU0sR0FBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUU1RCxPQUFPLGNBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUM7WUFDUixPQUFPLGNBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzNCLE1BQU0sUUFBUSxHQUFHLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUMvQyxNQUFNLGNBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRWxELE1BQU0sSUFBQSxpQkFBUSxFQUFDLFFBQVEsRUFBRSwwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==