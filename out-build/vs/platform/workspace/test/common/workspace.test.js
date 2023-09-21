/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/common/workspaces"], function (require, exports, assert, path_1, platform_1, resources_1, uri_1, workspace_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workspace', () => {
        const fileFolder = platform_1.$i ? 'c:\\src' : '/src';
        const abcFolder = platform_1.$i ? 'c:\\abc' : '/abc';
        const testFolderUri = uri_1.URI.file((0, path_1.$9d)(fileFolder, 'test'));
        const mainFolderUri = uri_1.URI.file((0, path_1.$9d)(fileFolder, 'main'));
        const test1FolderUri = uri_1.URI.file((0, path_1.$9d)(fileFolder, 'test1'));
        const test2FolderUri = uri_1.URI.file((0, path_1.$9d)(fileFolder, 'test2'));
        const test3FolderUri = uri_1.URI.file((0, path_1.$9d)(fileFolder, 'test3'));
        const abcTest1FolderUri = uri_1.URI.file((0, path_1.$9d)(abcFolder, 'test1'));
        const abcTest3FolderUri = uri_1.URI.file((0, path_1.$9d)(abcFolder, 'test3'));
        const workspaceConfigUri = uri_1.URI.file((0, path_1.$9d)(fileFolder, 'test.code-workspace'));
        test('getFolder returns the folder with given uri', () => {
            const expected = new workspace_1.$Vh({ uri: testFolderUri, name: '', index: 2 });
            const testObject = new workspace_1.$Uh('', [new workspace_1.$Vh({ uri: mainFolderUri, name: '', index: 0 }), expected, new workspace_1.$Vh({ uri: uri_1.URI.file('/src/code'), name: '', index: 2 })], false, null, () => !platform_1.$k);
            const actual = testObject.getFolder(expected.uri);
            assert.strictEqual(actual, expected);
        });
        test('getFolder returns the folder if the uri is sub', () => {
            const expected = new workspace_1.$Vh({ uri: testFolderUri, name: '', index: 0 });
            const testObject = new workspace_1.$Uh('', [expected, new workspace_1.$Vh({ uri: mainFolderUri, name: '', index: 1 }), new workspace_1.$Vh({ uri: uri_1.URI.file('/src/code'), name: '', index: 2 })], false, null, () => !platform_1.$k);
            const actual = testObject.getFolder(uri_1.URI.file((0, path_1.$9d)(fileFolder, 'test/a')));
            assert.strictEqual(actual, expected);
        });
        test('getFolder returns the closest folder if the uri is sub', () => {
            const expected = new workspace_1.$Vh({ uri: testFolderUri, name: '', index: 2 });
            const testObject = new workspace_1.$Uh('', [new workspace_1.$Vh({ uri: mainFolderUri, name: '', index: 0 }), new workspace_1.$Vh({ uri: uri_1.URI.file('/src/code'), name: '', index: 1 }), expected], false, null, () => !platform_1.$k);
            const actual = testObject.getFolder(uri_1.URI.file((0, path_1.$9d)(fileFolder, 'test/a')));
            assert.strictEqual(actual, expected);
        });
        test('getFolder returns the folder even if the uri has query path', () => {
            const expected = new workspace_1.$Vh({ uri: testFolderUri, name: '', index: 2 });
            const testObject = new workspace_1.$Uh('', [new workspace_1.$Vh({ uri: mainFolderUri, name: '', index: 0 }), new workspace_1.$Vh({ uri: uri_1.URI.file('/src/code'), name: '', index: 1 }), expected], false, null, () => !platform_1.$k);
            const actual = testObject.getFolder(uri_1.URI.file((0, path_1.$9d)(fileFolder, 'test/a')).with({ query: 'somequery' }));
            assert.strictEqual(actual, expected);
        });
        test('getFolder returns null if the uri is not sub', () => {
            const testObject = new workspace_1.$Uh('', [new workspace_1.$Vh({ uri: testFolderUri, name: '', index: 0 }), new workspace_1.$Vh({ uri: uri_1.URI.file('/src/code'), name: '', index: 1 })], false, null, () => !platform_1.$k);
            const actual = testObject.getFolder(uri_1.URI.file((0, path_1.$9d)(fileFolder, 'main/a')));
            assert.strictEqual(actual, null);
        });
        test('toWorkspaceFolders with single absolute folder', () => {
            const actual = (0, workspaces_1.$lU)([{ path: '/src/test' }], workspaceConfigUri, resources_1.$_f);
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].uri.fsPath, testFolderUri.fsPath);
            assert.strictEqual(actual[0].raw.path, '/src/test');
            assert.strictEqual(actual[0].index, 0);
            assert.strictEqual(actual[0].name, 'test');
        });
        test('toWorkspaceFolders with single relative folder', () => {
            const actual = (0, workspaces_1.$lU)([{ path: './test' }], workspaceConfigUri, resources_1.$_f);
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].uri.fsPath, testFolderUri.fsPath);
            assert.strictEqual(actual[0].raw.path, './test');
            assert.strictEqual(actual[0].index, 0);
            assert.strictEqual(actual[0].name, 'test');
        });
        test('toWorkspaceFolders with single absolute folder with name', () => {
            const actual = (0, workspaces_1.$lU)([{ path: '/src/test', name: 'hello' }], workspaceConfigUri, resources_1.$_f);
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].uri.fsPath, testFolderUri.fsPath);
            assert.strictEqual(actual[0].raw.path, '/src/test');
            assert.strictEqual(actual[0].index, 0);
            assert.strictEqual(actual[0].name, 'hello');
        });
        test('toWorkspaceFolders with multiple unique absolute folders', () => {
            const actual = (0, workspaces_1.$lU)([{ path: '/src/test2' }, { path: '/src/test3' }, { path: '/src/test1' }], workspaceConfigUri, resources_1.$_f);
            assert.strictEqual(actual.length, 3);
            assert.strictEqual(actual[0].uri.fsPath, test2FolderUri.fsPath);
            assert.strictEqual(actual[0].raw.path, '/src/test2');
            assert.strictEqual(actual[0].index, 0);
            assert.strictEqual(actual[0].name, 'test2');
            assert.strictEqual(actual[1].uri.fsPath, test3FolderUri.fsPath);
            assert.strictEqual(actual[1].raw.path, '/src/test3');
            assert.strictEqual(actual[1].index, 1);
            assert.strictEqual(actual[1].name, 'test3');
            assert.strictEqual(actual[2].uri.fsPath, test1FolderUri.fsPath);
            assert.strictEqual(actual[2].raw.path, '/src/test1');
            assert.strictEqual(actual[2].index, 2);
            assert.strictEqual(actual[2].name, 'test1');
        });
        test('toWorkspaceFolders with multiple unique absolute folders with names', () => {
            const actual = (0, workspaces_1.$lU)([{ path: '/src/test2' }, { path: '/src/test3', name: 'noName' }, { path: '/src/test1' }], workspaceConfigUri, resources_1.$_f);
            assert.strictEqual(actual.length, 3);
            assert.strictEqual(actual[0].uri.fsPath, test2FolderUri.fsPath);
            assert.strictEqual(actual[0].raw.path, '/src/test2');
            assert.strictEqual(actual[0].index, 0);
            assert.strictEqual(actual[0].name, 'test2');
            assert.strictEqual(actual[1].uri.fsPath, test3FolderUri.fsPath);
            assert.strictEqual(actual[1].raw.path, '/src/test3');
            assert.strictEqual(actual[1].index, 1);
            assert.strictEqual(actual[1].name, 'noName');
            assert.strictEqual(actual[2].uri.fsPath, test1FolderUri.fsPath);
            assert.strictEqual(actual[2].raw.path, '/src/test1');
            assert.strictEqual(actual[2].index, 2);
            assert.strictEqual(actual[2].name, 'test1');
        });
        test('toWorkspaceFolders with multiple unique absolute and relative folders', () => {
            const actual = (0, workspaces_1.$lU)([{ path: '/src/test2' }, { path: '/abc/test3', name: 'noName' }, { path: './test1' }], workspaceConfigUri, resources_1.$_f);
            assert.strictEqual(actual.length, 3);
            assert.strictEqual(actual[0].uri.fsPath, test2FolderUri.fsPath);
            assert.strictEqual(actual[0].raw.path, '/src/test2');
            assert.strictEqual(actual[0].index, 0);
            assert.strictEqual(actual[0].name, 'test2');
            assert.strictEqual(actual[1].uri.fsPath, abcTest3FolderUri.fsPath);
            assert.strictEqual(actual[1].raw.path, '/abc/test3');
            assert.strictEqual(actual[1].index, 1);
            assert.strictEqual(actual[1].name, 'noName');
            assert.strictEqual(actual[2].uri.fsPath, test1FolderUri.fsPath);
            assert.strictEqual(actual[2].raw.path, './test1');
            assert.strictEqual(actual[2].index, 2);
            assert.strictEqual(actual[2].name, 'test1');
        });
        test('toWorkspaceFolders with multiple absolute folders with duplicates', () => {
            const actual = (0, workspaces_1.$lU)([{ path: '/src/test2' }, { path: '/src/test2', name: 'noName' }, { path: '/src/test1' }], workspaceConfigUri, resources_1.$_f);
            assert.strictEqual(actual.length, 2);
            assert.strictEqual(actual[0].uri.fsPath, test2FolderUri.fsPath);
            assert.strictEqual(actual[0].raw.path, '/src/test2');
            assert.strictEqual(actual[0].index, 0);
            assert.strictEqual(actual[0].name, 'test2');
            assert.strictEqual(actual[1].uri.fsPath, test1FolderUri.fsPath);
            assert.strictEqual(actual[1].raw.path, '/src/test1');
            assert.strictEqual(actual[1].index, 1);
            assert.strictEqual(actual[1].name, 'test1');
        });
        test('toWorkspaceFolders with multiple absolute and relative folders with duplicates', () => {
            const actual = (0, workspaces_1.$lU)([{ path: '/src/test2' }, { path: '/src/test3', name: 'noName' }, { path: './test3' }, { path: '/abc/test1' }], workspaceConfigUri, resources_1.$_f);
            assert.strictEqual(actual.length, 3);
            assert.strictEqual(actual[0].uri.fsPath, test2FolderUri.fsPath);
            assert.strictEqual(actual[0].raw.path, '/src/test2');
            assert.strictEqual(actual[0].index, 0);
            assert.strictEqual(actual[0].name, 'test2');
            assert.strictEqual(actual[1].uri.fsPath, test3FolderUri.fsPath);
            assert.strictEqual(actual[1].raw.path, '/src/test3');
            assert.strictEqual(actual[1].index, 1);
            assert.strictEqual(actual[1].name, 'noName');
            assert.strictEqual(actual[2].uri.fsPath, abcTest1FolderUri.fsPath);
            assert.strictEqual(actual[2].raw.path, '/abc/test1');
            assert.strictEqual(actual[2].index, 2);
            assert.strictEqual(actual[2].name, 'test1');
        });
        test('toWorkspaceFolders with multiple absolute and relative folders with invalid paths', () => {
            const actual = (0, workspaces_1.$lU)([{ path: '/src/test2' }, { path: '', name: 'noName' }, { path: './test3' }, { path: '/abc/test1' }], workspaceConfigUri, resources_1.$_f);
            assert.strictEqual(actual.length, 3);
            assert.strictEqual(actual[0].uri.fsPath, test2FolderUri.fsPath);
            assert.strictEqual(actual[0].raw.path, '/src/test2');
            assert.strictEqual(actual[0].index, 0);
            assert.strictEqual(actual[0].name, 'test2');
            assert.strictEqual(actual[1].uri.fsPath, test3FolderUri.fsPath);
            assert.strictEqual(actual[1].raw.path, './test3');
            assert.strictEqual(actual[1].index, 1);
            assert.strictEqual(actual[1].name, 'test3');
            assert.strictEqual(actual[2].uri.fsPath, abcTest1FolderUri.fsPath);
            assert.strictEqual(actual[2].raw.path, '/abc/test1');
            assert.strictEqual(actual[2].index, 2);
            assert.strictEqual(actual[2].name, 'test1');
        });
    });
});
//# sourceMappingURL=workspace.test.js.map