/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/test/node/testUtils", "vs/base/node/pfs", "vs/base/test/common/snapshot", "vs/base/common/uri", "path", "vs/base/test/common/utils"], function (require, exports, os_1, testUtils_1, pfs_1, snapshot_1, uri_1, path, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // tests for snapshot are in Node so that we can use native FS operations to
    // set up and validate things.
    //
    // Uses snapshots for testing snapshots. It's snapception!
    suite('snapshot', () => {
        let testDir;
        setup(function () {
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'snapshot');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(function () {
            return pfs_1.Promises.rm(testDir);
        });
        const makeContext = (test) => {
            return new class extends snapshot_1.SnapshotContext {
                constructor() {
                    super(test);
                    this.snapshotsDir = uri_1.URI.file(testDir);
                }
            };
        };
        const snapshotFileTree = async () => {
            let str = '';
            const printDir = async (dir, indent) => {
                const children = await pfs_1.Promises.readdir(dir);
                for (const child of children) {
                    const p = path.join(dir, child);
                    if ((await pfs_1.Promises.stat(p)).isFile()) {
                        const content = await pfs_1.Promises.readFile(p, 'utf-8');
                        str += `${' '.repeat(indent)}${child}:\n`;
                        for (const line of content.split('\n')) {
                            str += `${' '.repeat(indent + 2)}${line}\n`;
                        }
                    }
                    else {
                        str += `${' '.repeat(indent)}${child}/\n`;
                        await printDir(p, indent + 2);
                    }
                }
            };
            await printDir(testDir, 0);
            await (0, snapshot_1.assertSnapshot)(str);
        };
        test('creates a snapshot', async () => {
            const ctx = makeContext({
                file: 'foo/bar',
                fullTitle: () => 'hello world!'
            });
            await ctx.assert({ cool: true });
            await snapshotFileTree();
        });
        test('validates a snapshot', async () => {
            const ctx1 = makeContext({
                file: 'foo/bar',
                fullTitle: () => 'hello world!'
            });
            await ctx1.assert({ cool: true });
            const ctx2 = makeContext({
                file: 'foo/bar',
                fullTitle: () => 'hello world!'
            });
            // should pass:
            await ctx2.assert({ cool: true });
            const ctx3 = makeContext({
                file: 'foo/bar',
                fullTitle: () => 'hello world!'
            });
            // should fail:
            await (0, utils_1.assertThrowsAsync)(() => ctx3.assert({ cool: false }));
        });
        test('cleans up old snapshots', async () => {
            const ctx1 = makeContext({
                file: 'foo/bar',
                fullTitle: () => 'hello world!'
            });
            await ctx1.assert({ cool: true });
            await ctx1.assert({ nifty: true });
            await ctx1.assert({ customName: 1 }, { name: 'thirdTest', extension: 'txt' });
            await ctx1.assert({ customName: 2 }, { name: 'fourthTest' });
            await snapshotFileTree();
            const ctx2 = makeContext({
                file: 'foo/bar',
                fullTitle: () => 'hello world!'
            });
            await ctx2.assert({ cool: true });
            await ctx2.assert({ customName: 1 }, { name: 'thirdTest' });
            await ctx2.removeOldSnapshots();
            await snapshotFileTree();
        });
        test('formats object nicely', async () => {
            const circular = {};
            circular.a = circular;
            await (0, snapshot_1.assertSnapshot)([
                1,
                true,
                undefined,
                null,
                123n,
                Symbol('heyo'),
                'hello',
                { hello: 'world' },
                circular,
                new Map([['hello', 1], ['goodbye', 2]]),
                new Set([1, 2, 3]),
                function helloWorld() { },
                /hello/g,
                new Array(10).fill('long string'.repeat(10)),
                { [Symbol.for('debug.description')]() { return `Range [1 -> 5]`; } },
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hcHNob3QudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvdGVzdC9ub2RlL3NuYXBzaG90LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFVaEcsNEVBQTRFO0lBQzVFLDhCQUE4QjtJQUM5QixFQUFFO0lBQ0YsMERBQTBEO0lBRTFELEtBQUssQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO1FBQ3RCLElBQUksT0FBZSxDQUFDO1FBRXBCLEtBQUssQ0FBQztZQUNMLE9BQU8sR0FBRyxJQUFBLDZCQUFpQixFQUFDLElBQUEsV0FBTSxHQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlELE9BQU8sY0FBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQztZQUNSLE9BQU8sY0FBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBcUMsRUFBRSxFQUFFO1lBQzdELE9BQU8sSUFBSSxLQUFNLFNBQVEsMEJBQWU7Z0JBQ3ZDO29CQUNDLEtBQUssQ0FBQyxJQUFrQixDQUFDLENBQUM7b0JBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkMsQ0FBQzthQUNELENBQUM7UUFDSCxDQUFDLENBQUM7UUFFRixNQUFNLGdCQUFnQixHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ25DLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUViLE1BQU0sUUFBUSxHQUFHLEtBQUssRUFBRSxHQUFXLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQ3RELE1BQU0sUUFB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