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
            testDir = (0, testUtils_1.$oT)((0, os_1.tmpdir)(), 'vsctests', 'snapshot');
            return pfs_1.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(function () {
            return pfs_1.Promises.rm(testDir);
        });
        const makeContext = (test) => {
            return new class extends snapshot_1.$vT {
                constructor() {
                    super(test);
                    this.d = uri_1.URI.file(testDir);
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
            await (0, snapshot_1.$wT)(str);
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
            await (0, utils_1.$aT)(() => ctx3.assert({ cool: false }));
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
            await (0, snapshot_1.$wT)([
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
//# sourceMappingURL=snapshot.test.js.map