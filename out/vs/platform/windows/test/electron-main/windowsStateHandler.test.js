/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "vs/base/common/path", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/windows/electron-main/windowsStateHandler"], function (require, exports, assert, os_1, path_1, uri_1, utils_1, windowsStateHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Windows State Storing', () => {
        function getUIState() {
            return {
                x: 0,
                y: 10,
                width: 100,
                height: 200,
                mode: 0
            };
        }
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
        function assertEqualWindowState(expected, actual, message) {
            if (!expected || !actual) {
                assert.deepStrictEqual(expected, actual, message);
                return;
            }
            assert.strictEqual(expected.backupPath, actual.backupPath, message);
            assertEqualURI(expected.folderUri, actual.folderUri, message);
            assert.strictEqual(expected.remoteAuthority, actual.remoteAuthority, message);
            assertEqualWorkspace(expected.workspace, actual.workspace, message);
            assert.deepStrictEqual(expected.uiState, actual.uiState, message);
        }
        function assertEqualWindowsState(expected, actual, message) {
            assertEqualWindowState(expected.lastPluginDevelopmentHostWindow, actual.lastPluginDevelopmentHostWindow, message);
            assertEqualWindowState(expected.lastActiveWindow, actual.lastActiveWindow, message);
            assert.strictEqual(expected.openedWindows.length, actual.openedWindows.length, message);
            for (let i = 0; i < expected.openedWindows.length; i++) {
                assertEqualWindowState(expected.openedWindows[i], actual.openedWindows[i], message);
            }
        }
        function assertRestoring(state, message) {
            const stored = (0, windowsStateHandler_1.getWindowsStateStoreData)(state);
            const restored = (0, windowsStateHandler_1.restoreWindowsState)(stored);
            assertEqualWindowsState(state, restored, message);
        }
        const testBackupPath1 = (0, path_1.join)((0, os_1.tmpdir)(), 'windowStateTest', 'backupFolder1');
        const testBackupPath2 = (0, path_1.join)((0, os_1.tmpdir)(), 'windowStateTest', 'backupFolder2');
        const testWSPath = uri_1.URI.file((0, path_1.join)((0, os_1.tmpdir)(), 'windowStateTest', 'test.code-workspace'));
        const testFolderURI = uri_1.URI.file((0, path_1.join)((0, os_1.tmpdir)(), 'windowStateTest', 'testFolder'));
        const testRemoteFolderURI = uri_1.URI.parse('foo://bar/c/d');
        test('storing and restoring', () => {
            let windowState;
            windowState = {
                openedWindows: []
            };
            assertRestoring(windowState, 'no windows');
            windowState = {
                openedWindows: [{ backupPath: testBackupPath1, uiState: getUIState() }]
            };
            assertRestoring(windowState, 'empty workspace');
            windowState = {
                openedWindows: [{ backupPath: testBackupPath1, uiState: getUIState(), workspace: toWorkspace(testWSPath) }]
            };
            assertRestoring(windowState, 'workspace');
            windowState = {
                openedWindows: [{ backupPath: testBackupPath2, uiState: getUIState(), folderUri: testFolderURI }]
            };
            assertRestoring(windowState, 'folder');
            windowState = {
                openedWindows: [{ backupPath: testBackupPath1, uiState: getUIState(), folderUri: testFolderURI }, { backupPath: testBackupPath1, uiState: getUIState(), folderUri: testRemoteFolderURI, remoteAuthority: 'bar' }]
            };
            assertRestoring(windowState, 'multiple windows');
            windowState = {
                lastActiveWindow: { backupPath: testBackupPath2, uiState: getUIState(), folderUri: testFolderURI },
                openedWindows: []
            };
            assertRestoring(windowState, 'lastActiveWindow');
            windowState = {
                lastPluginDevelopmentHostWindow: { backupPath: testBackupPath2, uiState: getUIState(), folderUri: testFolderURI },
                openedWindows: []
            };
            assertRestoring(windowState, 'lastPluginDevelopmentHostWindow');
        });
        test('open 1_32', () => {
            const v1_32_workspace = `{
			"openedWindows": [],
			"lastActiveWindow": {
				"workspaceIdentifier": {
					"id": "53b714b46ef1a2d4346568b4f591028c",
					"configURIPath": "file:///home/user/workspaces/testing/custom.code-workspace"
				},
				"backupPath": "/home/user/.config/code-oss-dev/Backups/53b714b46ef1a2d4346568b4f591028c",
				"uiState": {
					"mode": 0,
					"x": 0,
					"y": 27,
					"width": 2560,
					"height": 1364
				}
			}
		}`;
            let windowsState = (0, windowsStateHandler_1.restoreWindowsState)(JSON.parse(v1_32_workspace));
            let expected = {
                openedWindows: [],
                lastActiveWindow: {
                    backupPath: '/home/user/.config/code-oss-dev/Backups/53b714b46ef1a2d4346568b4f591028c',
                    uiState: { mode: 0 /* WindowMode.Maximized */, x: 0, y: 27, width: 2560, height: 1364 },
                    workspace: { id: '53b714b46ef1a2d4346568b4f591028c', configPath: uri_1.URI.parse('file:///home/user/workspaces/testing/custom.code-workspace') }
                }
            };
            assertEqualWindowsState(expected, windowsState, 'v1_32_workspace');
            const v1_32_folder = `{
			"openedWindows": [],
			"lastActiveWindow": {
				"folder": "file:///home/user/workspaces/testing/folding",
				"backupPath": "/home/user/.config/code-oss-dev/Backups/1daac1621c6c06f9e916ac8062e5a1b5",
				"uiState": {
					"mode": 1,
					"x": 625,
					"y": 263,
					"width": 1718,
					"height": 953
				}
			}
		}`;
            windowsState = (0, windowsStateHandler_1.restoreWindowsState)(JSON.parse(v1_32_folder));
            expected = {
                openedWindows: [],
                lastActiveWindow: {
                    backupPath: '/home/user/.config/code-oss-dev/Backups/1daac1621c6c06f9e916ac8062e5a1b5',
                    uiState: { mode: 1 /* WindowMode.Normal */, x: 625, y: 263, width: 1718, height: 953 },
                    folderUri: uri_1.URI.parse('file:///home/user/workspaces/testing/folding')
                }
            };
            assertEqualWindowsState(expected, windowsState, 'v1_32_folder');
            const v1_32_empty_window = ` {
			"openedWindows": [
			],
			"lastActiveWindow": {
				"backupPath": "/home/user/.config/code-oss-dev/Backups/1549539668998",
				"uiState": {
					"mode": 1,
					"x": 768,
					"y": 336,
					"width": 1024,
					"height": 768
				}
			}
		}`;
            windowsState = (0, windowsStateHandler_1.restoreWindowsState)(JSON.parse(v1_32_empty_window));
            expected = {
                openedWindows: [],
                lastActiveWindow: {
                    backupPath: '/home/user/.config/code-oss-dev/Backups/1549539668998',
                    uiState: { mode: 1 /* WindowMode.Normal */, x: 768, y: 336, width: 1024, height: 768 }
                }
            };
            assertEqualWindowsState(expected, windowsState, 'v1_32_empty_window');
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c1N0YXRlSGFuZGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93cy90ZXN0L2VsZWN0cm9uLW1haW4vd2luZG93c1N0YXRlSGFuZGxlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBV2hHLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7UUFFbkMsU0FBUyxVQUFVO1lBQ2xCLE9BQU87Z0JBQ04sQ0FBQyxFQUFFLENBQUM7Z0JBQ0osQ0FBQyxFQUFFLEVBQUU7Z0JBQ0wsS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsTUFBTSxFQUFFLEdBQUc7Z0JBQ1gsSUFBSSxFQUFFLENBQUM7YUFDUCxDQUFDO1FBQ0gsQ0FBQztRQUVELFNBQVMsV0FBVyxDQUFDLEdBQVE7WUFDNUIsT0FBTztnQkFDTixFQUFFLEVBQUUsTUFBTTtnQkFDVixVQUFVLEVBQUUsR0FBRzthQUNmLENBQUM7UUFDSCxDQUFDO1FBQ0QsU0FBUyxjQUFjLENBQUMsRUFBbUIsRUFBRSxFQUFtQixFQUFFLE9BQWdCO1lBQ2pGLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxTQUFTLG9CQUFvQixDQUFDLEVBQW9DLEVBQUUsRUFBb0MsRUFBRSxPQUFnQjtZQUN6SCxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUNmLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDcEMsT0FBTzthQUNQO1lBQ0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxF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