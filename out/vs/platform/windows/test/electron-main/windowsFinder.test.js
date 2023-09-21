/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/windows/electron-main/windowsFinder", "vs/platform/workspaces/common/workspaces", "vs/base/common/network", "vs/base/test/common/utils"], function (require, exports, assert, event_1, path_1, resources_1, uri_1, windowsFinder_1, workspaces_1, network_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('WindowsFinder', () => {
        const fixturesFolder = network_1.FileAccess.asFileUri('vs/platform/windows/test/electron-main/fixtures').fsPath;
        const testWorkspace = {
            id: Date.now().toString(),
            configPath: uri_1.URI.file((0, path_1.join)(fixturesFolder, 'workspaces.json'))
        };
        const testWorkspaceFolders = (0, workspaces_1.toWorkspaceFolders)([{ path: (0, path_1.join)(fixturesFolder, 'vscode_workspace_1_folder') }, { path: (0, path_1.join)(fixturesFolder, 'vscode_workspace_2_folder') }], testWorkspace.configPath, resources_1.extUriBiasedIgnorePathCase);
        const localWorkspaceResolver = async (workspace) => { return workspace === testWorkspace ? { id: testWorkspace.id, configPath: workspace.configPath, folders: testWorkspaceFolders } : undefined; };
        function createTestCodeWindow(options) {
            return new class {
                constructor() {
                    this.onWillLoad = event_1.Event.None;
                    this.onDidTriggerSystemContextMenu = event_1.Event.None;
                    this.onDidSignalReady = event_1.Event.None;
                    this.onDidClose = event_1.Event.None;
                    this.onDidDestroy = event_1.Event.None;
                    this.whenClosedOrLoaded = Promise.resolve();
                    this.id = -1;
                    this.win = null;
                    this.openedWorkspace = options.openedFolderUri ? { id: '', uri: options.openedFolderUri } : options.openedWorkspace;
                    this.isExtensionDevelopmentHost = false;
                    this.isExtensionTestHost = false;
                    this.lastFocusTime = options.lastFocusTime;
                    this.isFullScreen = false;
                    this.isReady = true;
                }
                ready() { throw new Error('Method not implemented.'); }
                setReady() { throw new Error('Method not implemented.'); }
                addTabbedWindow(window) { throw new Error('Method not implemented.'); }
                load(config, options) { throw new Error('Method not implemented.'); }
                reload(cli) { throw new Error('Method not implemented.'); }
                focus(options) { throw new Error('Method not implemented.'); }
                close() { throw new Error('Method not implemented.'); }
                getBounds() { throw new Error('Method not implemented.'); }
                send(channel, ...args) { throw new Error('Method not implemented.'); }
                sendWhenReady(channel, token, ...args) { throw new Error('Method not implemented.'); }
                toggleFullScreen() { throw new Error('Method not implemented.'); }
                isMinimized() { throw new Error('Method not implemented.'); }
                setRepresentedFilename(name) { throw new Error('Method not implemented.'); }
                getRepresentedFilename() { throw new Error('Method not implemented.'); }
                setDocumentEdited(edited) { throw new Error('Method not implemented.'); }
                isDocumentEdited() { throw new Error('Method not implemented.'); }
                handleTitleDoubleClick() { throw new Error('Method not implemented.'); }
                updateTouchBar(items) { throw new Error('Method not implemented.'); }
                serializeWindowState() { throw new Error('Method not implemented'); }
                updateWindowControls(options) { throw new Error('Method not implemented.'); }
                dispose() { }
            };
        }
        const vscodeFolderWindow = createTestCodeWindow({ lastFocusTime: 1, openedFolderUri: uri_1.URI.file((0, path_1.join)(fixturesFolder, 'vscode_folder')) });
        const lastActiveWindow = createTestCodeWindow({ lastFocusTime: 3, openedFolderUri: undefined });
        const noVscodeFolderWindow = createTestCodeWindow({ lastFocusTime: 2, openedFolderUri: uri_1.URI.file((0, path_1.join)(fixturesFolder, 'no_vscode_folder')) });
        const windows = [
            vscodeFolderWindow,
            lastActiveWindow,
            noVscodeFolderWindow,
        ];
        test('New window without folder when no windows exist', async () => {
            assert.strictEqual(await (0, windowsFinder_1.findWindowOnFile)([], uri_1.URI.file('nonexisting'), localWorkspaceResolver), undefined);
            assert.strictEqual(await (0, windowsFinder_1.findWindowOnFile)([], uri_1.URI.file((0, path_1.join)(fixturesFolder, 'no_vscode_folder', 'file.txt')), localWorkspaceResolver), undefined);
        });
        test('Existing window with folder', async () => {
            assert.strictEqual(await (0, windowsFinder_1.findWindowOnFile)(windows, uri_1.URI.file((0, path_1.join)(fixturesFolder, 'no_vscode_folder', 'file.txt')), localWorkspaceResolver), noVscodeFolderWindow);
            assert.strictEqual(await (0, windowsFinder_1.findWindowOnFile)(windows, uri_1.URI.file((0, path_1.join)(fixturesFolder, 'vscode_folder', 'file.txt')), localWorkspaceResolver), vscodeFolderWindow);
            const window = createTestCodeWindow({ lastFocusTime: 1, openedFolderUri: uri_1.URI.file((0, path_1.join)(fixturesFolder, 'vscode_folder', 'nested_folder')) });
            assert.strictEqual(await (0, windowsFinder_1.findWindowOnFile)([window], uri_1.URI.file((0, path_1.join)(fixturesFolder, 'vscode_folder', 'nested_folder', 'subfolder', 'file.txt')), localWorkspaceResolver), window);
        });
        test('More specific existing window wins', async () => {
            const window = createTestCodeWindow({ lastFocusTime: 2, openedFolderUri: uri_1.URI.file((0, path_1.join)(fixturesFolder, 'no_vscode_folder')) });
            const nestedFolderWindow = createTestCodeWindow({ lastFocusTime: 1, openedFolderUri: uri_1.URI.file((0, path_1.join)(fixturesFolder, 'no_vscode_folder', 'nested_folder')) });
            assert.strictEqual(await (0, windowsFinder_1.findWindowOnFile)([window, nestedFolderWindow], uri_1.URI.file((0, path_1.join)(fixturesFolder, 'no_vscode_folder', 'nested_folder', 'subfolder', 'file.txt')), localWorkspaceResolver), nestedFolderWindow);
        });
        test('Workspace folder wins', async () => {
            const window = createTestCodeWindow({ lastFocusTime: 1, openedWorkspace: testWorkspace });
            assert.strictEqual(await (0, windowsFinder_1.findWindowOnFile)([window], uri_1.URI.file((0, path_1.join)(fixturesFolder, 'vscode_workspace_2_folder', 'nested_vscode_folder', 'subfolder', 'file.txt')), localWorkspaceResolver), window);
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c0ZpbmRlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93cy90ZXN0L2VsZWN0cm9uLW1haW4vd2luZG93c0ZpbmRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBa0JoRyxLQUFLLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtRQUUzQixNQUFNLGNBQWMsR0FBRyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxpREFBaUQsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUV0RyxNQUFNLGFBQWEsR0FBeUI7WUFDM0MsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUU7WUFDekIsVUFBVSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBQSxXQUFJLEVBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDLENBQUM7U0FDN0QsQ0FBQztRQUVGLE1BQU0sb0JBQW9CLEdBQUcsSUFBQSwrQkFBa0IsRUFBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUEsV0FBSSxFQUFDLGNBQWMsRUFBRSwyQkFBMkIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBQSxXQUFJLEVBQUMsY0FBYyxFQUFFLDJCQUEyQixDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxVQUFVLEVBQUUsc0NBQTBCLENBQUMsQ0FBQztRQUNsTyxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxTQUFjLEVBQUUsRUFBRSxHQUFHLE9BQU8sU0FBUyxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FB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