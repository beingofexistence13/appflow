/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "os", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/base/node/pfs", "vs/base/test/node/testUtils", "vs/platform/workspaces/node/workspaces"], function (require, exports, assert, fs, os, path, platform_1, uri_1, pfs, testUtils_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('Workspaces', () => {
        let testDir;
        const tmpDir = os.tmpdir();
        setup(async () => {
            testDir = (0, testUtils_1.$oT)(tmpDir, 'vsctests', 'workspacesmanagementmainservice');
            return pfs.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return pfs.Promises.rm(testDir);
        });
        test('getSingleWorkspaceIdentifier', async function () {
            const nonLocalUri = uri_1.URI.parse('myscheme://server/work/p/f1');
            const nonLocalUriId = (0, workspaces_1.$J5b)(nonLocalUri);
            assert.ok(nonLocalUriId?.id);
            const localNonExistingUri = uri_1.URI.file(path.$9d(testDir, 'f1'));
            const localNonExistingUriId = (0, workspaces_1.$J5b)(localNonExistingUri);
            assert.ok(!localNonExistingUriId);
            fs.mkdirSync(path.$9d(testDir, 'f1'));
            const localExistingUri = uri_1.URI.file(path.$9d(testDir, 'f1'));
            const localExistingUriId = (0, workspaces_1.$J5b)(localExistingUri, fs.statSync(localExistingUri.fsPath));
            assert.ok(localExistingUriId?.id);
        });
        test('workspace identifiers are stable', function () {
            // workspace identifier (local)
            assert.strictEqual((0, workspaces_1.$I5b)(uri_1.URI.file('/hello/test')).id, platform_1.$i /* slash vs backslash */ ? '9f3efb614e2cd7924e4b8076e6c72233' : 'e36736311be12ff6d695feefe415b3e8');
            // single folder identifier (local)
            const fakeStat = {
                ino: 1611312115129,
                birthtimeMs: 1611312115129,
                birthtime: new Date(1611312115129)
            };
            assert.strictEqual((0, workspaces_1.$J5b)(uri_1.URI.file('/hello/test'), fakeStat)?.id, platform_1.$i /* slash vs backslash */ ? '9a8441e897e5174fa388bc7ef8f7a710' : '1d726b3d516dc2a6d343abf4797eaaef');
            // workspace identifier (remote)
            assert.strictEqual((0, workspaces_1.$I5b)(uri_1.URI.parse('vscode-remote:/hello/test')).id, '786de4f224d57691f218dc7f31ee2ee3');
            // single folder identifier (remote)
            assert.strictEqual((0, workspaces_1.$J5b)(uri_1.URI.parse('vscode-remote:/hello/test'))?.id, '786de4f224d57691f218dc7f31ee2ee3');
        });
    });
});
//# sourceMappingURL=workspaces.test.js.map