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
            testDir = (0, testUtils_1.getRandomTestPath)(tmpDir, 'vsctests', 'workspacesmanagementmainservice');
            return pfs.Promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return pfs.Promises.rm(testDir);
        });
        test('getSingleWorkspaceIdentifier', async function () {
            const nonLocalUri = uri_1.URI.parse('myscheme://server/work/p/f1');
            const nonLocalUriId = (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(nonLocalUri);
            assert.ok(nonLocalUriId?.id);
            const localNonExistingUri = uri_1.URI.file(path.join(testDir, 'f1'));
            const localNonExistingUriId = (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(localNonExistingUri);
            assert.ok(!localNonExistingUriId);
            fs.mkdirSync(path.join(testDir, 'f1'));
            const localExistingUri = uri_1.URI.file(path.join(testDir, 'f1'));
            const localExistingUriId = (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(localExistingUri, fs.statSync(localExistingUri.fsPath));
            assert.ok(localExistingUriId?.id);
        });
        test('workspace identifiers are stable', function () {
            // workspace identifier (local)
            assert.strictEqual((0, workspaces_1.getWorkspaceIdentifier)(uri_1.URI.file('/hello/test')).id, platform_1.isWindows /* slash vs backslash */ ? '9f3efb614e2cd7924e4b8076e6c72233' : 'e36736311be12ff6d695feefe415b3e8');
            // single folder identifier (local)
            const fakeStat = {
                ino: 1611312115129,
                birthtimeMs: 1611312115129,
                birthtime: new Date(1611312115129)
            };
            assert.strictEqual((0, workspaces_1.getSingleFolderWorkspaceIdentifier)(uri_1.URI.file('/hello/test'), fakeStat)?.id, platform_1.isWindows /* slash vs backslash */ ? '9a8441e897e5174fa388bc7ef8f7a710' : '1d726b3d516dc2a6d343abf4797eaaef');
            // workspace identifier (remote)
            assert.strictEqual((0, workspaces_1.getWorkspaceIdentifier)(uri_1.URI.parse('vscode-remote:/hello/test')).id, '786de4f224d57691f218dc7f31ee2ee3');
            // single folder identifier (remote)
            assert.strictEqual((0, workspaces_1.getSingleFolderWorkspaceIdentifier)(uri_1.URI.parse('vscode-remote:/hello/test'))?.id, '786de4f224d57691f218dc7f31ee2ee3');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd29ya3NwYWNlcy90ZXN0L2VsZWN0cm9uLW1haW4vd29ya3NwYWNlcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBWWhHLElBQUEsc0JBQVUsRUFBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBRTdCLElBQUksT0FBZSxDQUFDO1FBRXBCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUUzQixLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDaEIsT0FBTyxHQUFHLElBQUEsNkJBQWlCLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO1lBRW5GLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw4QkFBOEIsRUFBRSxLQUFLO1lBQ3pDLE1BQU0sV0FBVyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUM3RCxNQUFNLGFBQWEsR0FBRyxJQUFBLCtDQUFrQyxFQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRTdCLE1BQU0sbUJBQW1CLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0scUJBQXFCLEdBQUcsSUFBQSwrQ0FBa0MsRUFBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRWxDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUV2QyxNQUFNLGdCQUFnQixHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1RCxNQUFNLGtCQUFrQixHQUFHLElBQUEsK0NBQWtDLEVBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3RILE1BQU0sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0NBQWtDLEVBQUU7WUFFeEMsK0JBQStCO1lBQy9CLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSxtQ0FBc0IsRUFBQyxTQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLG9CQUFTLENBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1lBRXRMLG1DQUFtQztZQUNuQyxNQUFNLFFBQVEsR0FBRztnQkFDaEIsR0FBRyxFQUFFLGFBQWE7Z0JBQ2xCLFdBQVcsRUFBRSxhQUFhO2dCQUMxQixTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDO2FBQ2xDLENBQUM7WUFDRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsK0NBQWtDLEVBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxRQUFvQixDQUFDLEVBQUUsRUFBRSxFQUFFLG9CQUFTLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1lBRXhOLGdDQUFnQztZQUNoQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsbUNBQXNCLEVBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLGtDQUFrQyxDQUFDLENBQUM7WUFFMUgsb0NBQW9DO1lBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSwrQ0FBa0MsRUFBQyxTQUFHLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztRQUN4SSxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=