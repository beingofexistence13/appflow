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
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'extpath');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return pfs_1.Promises.rm(testDir);
        });
        test('realcaseSync', async () => {
            // assume case insensitive file system
            if (process.platform === 'win32' || process.platform === 'darwin') {
                const upper = testDir.toUpperCase();
                const real = (0, extpath_1.realcaseSync)(upper);
                if (real) { // can be null in case of permission errors
                    assert.notStrictEqual(real, upper);
                    assert.strictEqual(real.toUpperCase(), upper);
                    assert.strictEqual(real, testDir);
                }
            }
            // linux, unix, etc. -> assume case sensitive file system
            else {
                let real = (0, extpath_1.realcaseSync)(testDir);
                assert.strictEqual(real, testDir);
                real = (0, extpath_1.realcaseSync)(testDir.toUpperCase());
                assert.strictEqual(real, testDir.toUpperCase());
            }
        });
        test('realcase', async () => {
            // assume case insensitive file system
            if (process.platform === 'win32' || process.platform === 'darwin') {
                const upper = testDir.toUpperCase();
                const real = await (0, extpath_1.realcase)(upper);
                if (real) { // can be null in case of permission errors
                    assert.notStrictEqual(real, upper);
                    assert.strictEqual(real.toUpperCase(), upper);
                    assert.strictEqual(real, testDir);
                }
            }
            // linux, unix, etc. -> assume case sensitive file system
            else {
                let real = await (0, extpath_1.realcase)(testDir);
                assert.strictEqual(real, testDir);
                real = await (0, extpath_1.realcase)(testDir.toUpperCase());
                assert.strictEqual(real, testDir.toUpperCase());
            }
        });
        test('realpath', async () => {
            const realpathVal = await (0, extpath_1.realpath)(testDir);
            assert.ok(realpathVal);
        });
        test('realpathSync', () => {
            const realpath = (0, extpath_1.realpathSync)(testDir);
            assert.ok(realpath);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cGF0aC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L25vZGUvZXh0cGF0aC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBU2hHLElBQUEsc0JBQVUsRUFBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1FBQzFCLElBQUksT0FBZSxDQUFDO1FBRXBCLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixPQUFPLEdBQUcsSUFBQSw2QkFBaUIsRUFBQyxJQUFBLFdBQU0sR0FBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUU3RCxPQUFPLGNBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsT0FBTyxjQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsRUFBRSxLQUFLLElBQUksRUFBRTtZQUUvQixzQ0FBc0M7WUFDdEMsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtnQkFDbEUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLElBQUksR0FBRyxJQUFBLHNCQUFZLEVBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRWpDLElBQUksSUFBSSxFQUFFLEVBQUUsMkNBQTJDO29CQUN0RCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDbkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzlDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUNsQzthQUNEO1lBRUQseURBQXlEO2lCQUNwRDtnQkFDSixJQUFJLElBQUksR0FBRyxJQUFBLHNCQUFZLEVBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUVsQyxJQUFJLEdBQUcsSUFBQSxzQkFBWSxFQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzthQUNoRDtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUUzQixzQ0FBc0M7WUFDdEMsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtnQkFDbEUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUEsa0JBQVEsRUFBQyxLQUFLLENBQUMsQ0FBQztnQkFFbkMsSUFBSSxJQUFJLEVBQUUsRUFBRSwyQ0FBMkM7b0JBQ3RELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNuQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDOUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQ2xDO2FBQ0Q7WUFFRCx5REFBeUQ7aUJBQ3BEO2dCQUNKLElBQUksSUFBSSxHQUFHLE1BQU0sSUFBQSxrQkFBUSxFQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFbEMsSUFBSSxHQUFHLE1BQU0sSUFBQSxrQkFBUSxFQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzthQUNoRDtRQUNGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUMzQixNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsa0JBQVEsRUFBQyxPQUFPLENBQUMsQ0FBQztZQUM1QyxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7WUFDekIsTUFBTSxRQUFRLEdBQUcsSUFBQSxzQkFBWSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUMifQ==