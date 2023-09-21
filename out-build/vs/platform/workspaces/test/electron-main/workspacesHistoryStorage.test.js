/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "vs/base/common/path", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/log/common/log", "vs/platform/workspaces/common/workspaces"], function (require, exports, assert, os_1, path_1, uri_1, utils_1, log_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('History Storage', () => {
        function toWorkspace(uri) {
            return {
                id: '1234',
                configPath: uri
            };
        }
        function assertEqualURI(u1, u2, message) {
            assert.strictEqual(u1 && u1.toString(), u2 && u2.toString(), message);
        }
        function assertEqualWorkspace(w1, w2, message) {
            if (!w1 || !w2) {
                assert.strictEqual(w1, w2, message);
                return;
            }
            assert.strictEqual(w1.id, w2.id, message);
            assertEqualURI(w1.configPath, w2.configPath, message);
        }
        function assertEqualRecentlyOpened(actual, expected, message) {
            assert.strictEqual(actual.files.length, expected.files.length, message);
            for (let i = 0; i < actual.files.length; i++) {
                assertEqualURI(actual.files[i].fileUri, expected.files[i].fileUri, message);
                assert.strictEqual(actual.files[i].label, expected.files[i].label);
                assert.strictEqual(actual.files[i].remoteAuthority, expected.files[i].remoteAuthority);
            }
            assert.strictEqual(actual.workspaces.length, expected.workspaces.length, message);
            for (let i = 0; i < actual.workspaces.length; i++) {
                const expectedRecent = expected.workspaces[i];
                const actualRecent = actual.workspaces[i];
                if ((0, workspaces_1.$hU)(actualRecent)) {
                    assertEqualURI(actualRecent.folderUri, expectedRecent.folderUri, message);
                }
                else {
                    assertEqualWorkspace(actualRecent.workspace, expectedRecent.workspace, message);
                }
                assert.strictEqual(actualRecent.label, expectedRecent.label);
                assert.strictEqual(actualRecent.remoteAuthority, actualRecent.remoteAuthority);
            }
        }
        function assertRestoring(state, message) {
            const stored = (0, workspaces_1.$oU)(state);
            const restored = (0, workspaces_1.$nU)(stored, new log_1.$fj());
            assertEqualRecentlyOpened(state, restored, message);
        }
        const testWSPath = uri_1.URI.file((0, path_1.$9d)((0, os_1.tmpdir)(), 'windowStateTest', 'test.code-workspace'));
        const testFileURI = uri_1.URI.file((0, path_1.$9d)((0, os_1.tmpdir)(), 'windowStateTest', 'testFile.txt'));
        const testFolderURI = uri_1.URI.file((0, path_1.$9d)((0, os_1.tmpdir)(), 'windowStateTest', 'testFolder'));
        const testRemoteFolderURI = uri_1.URI.parse('foo://bar/c/e');
        const testRemoteFileURI = uri_1.URI.parse('foo://bar/c/d.txt');
        const testRemoteWSURI = uri_1.URI.parse('foo://bar/c/test.code-workspace');
        test('storing and restoring', () => {
            let ro;
            ro = {
                files: [],
                workspaces: []
            };
            assertRestoring(ro, 'empty');
            ro = {
                files: [{ fileUri: testFileURI }],
                workspaces: []
            };
            assertRestoring(ro, 'file');
            ro = {
                files: [],
                workspaces: [{ folderUri: testFolderURI }]
            };
            assertRestoring(ro, 'folder');
            ro = {
                files: [],
                workspaces: [{ workspace: toWorkspace(testWSPath) }, { folderUri: testFolderURI }]
            };
            assertRestoring(ro, 'workspaces and folders');
            ro = {
                files: [{ fileUri: testRemoteFileURI }],
                workspaces: [{ workspace: toWorkspace(testRemoteWSURI) }, { folderUri: testRemoteFolderURI }]
            };
            assertRestoring(ro, 'remote workspaces and folders');
            ro = {
                files: [{ label: 'abc', fileUri: testFileURI }],
                workspaces: [{ label: 'def', workspace: toWorkspace(testWSPath) }, { folderUri: testRemoteFolderURI }]
            };
            assertRestoring(ro, 'labels');
            ro = {
                files: [{ label: 'abc', remoteAuthority: 'test', fileUri: testRemoteFileURI }],
                workspaces: [{ label: 'def', remoteAuthority: 'test', workspace: toWorkspace(testWSPath) }, { folderUri: testRemoteFolderURI, remoteAuthority: 'test' }]
            };
            assertRestoring(ro, 'authority');
        });
        test('open 1_55', () => {
            const v1_55 = `{
			"entries": [
				{
					"folderUri": "foo://bar/23/43",
					"remoteAuthority": "test+test"
				},
				{
					"workspace": {
						"id": "53b714b46ef1a2d4346568b4f591028c",
						"configPath": "file:///home/user/workspaces/testing/custom.code-workspace"
					}
				},
				{
					"folderUri": "file:///home/user/workspaces/testing/folding",
					"label": "abc"
				},
				{
					"fileUri": "file:///home/user/.config/code-oss-dev/storage.json",
					"label": "def"
				}
			]
		}`;
            const windowsState = (0, workspaces_1.$nU)(JSON.parse(v1_55), new log_1.$fj());
            const expected = {
                files: [{ label: 'def', fileUri: uri_1.URI.parse('file:///home/user/.config/code-oss-dev/storage.json') }],
                workspaces: [
                    { folderUri: uri_1.URI.parse('foo://bar/23/43'), remoteAuthority: 'test+test' },
                    { workspace: { id: '53b714b46ef1a2d4346568b4f591028c', configPath: uri_1.URI.parse('file:///home/user/workspaces/testing/custom.code-workspace') } },
                    { label: 'abc', folderUri: uri_1.URI.parse('file:///home/user/workspaces/testing/folding') }
                ]
            };
            assertEqualRecentlyOpened(windowsState, expected, 'v1_33');
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=workspacesHistoryStorage.test.js.map