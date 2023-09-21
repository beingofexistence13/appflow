/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/path", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostWorkspace", "vs/base/test/common/mock", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/api/common/extHostRpcService", "vs/base/common/platform", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, cancellation_1, path_1, uri_1, extensions_1, log_1, extHost_protocol_1, extHostTypes_1, extHostWorkspace_1, mock_1, testRPCProtocol_1, extHostRpcService_1, platform_1, extensions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createExtHostWorkspace(mainContext, data, logService) {
        const result = new extHostWorkspace_1.$ibc(new extHostRpcService_1.$3L(mainContext), new class extends (0, mock_1.$rT)() {
            constructor() {
                super(...arguments);
                this.workspace = data;
            }
        }, new class extends (0, mock_1.$rT)() {
            getCapabilities() { return platform_1.$k ? 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */ : undefined; }
        }, logService, new class extends (0, mock_1.$rT)() {
        });
        result.$initializeWorkspace(data, true);
        return result;
    }
    suite('ExtHostWorkspace', function () {
        function assertAsRelativePath(workspace, input, expected, includeWorkspace) {
            const actual = workspace.getRelativePath(input, includeWorkspace);
            assert.strictEqual(actual, expected);
        }
        test('asRelativePath', () => {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/Applications/NewsWoWBot'), 0)], name: 'Test' }, new log_1.$fj());
            assertAsRelativePath(ws, '/Coding/Applications/NewsWoWBot/bernd/das/brot', 'bernd/das/brot');
            assertAsRelativePath(ws, '/Apps/DartPubCache/hosted/pub.dartlang.org/convert-2.0.1/lib/src/hex.dart', '/Apps/DartPubCache/hosted/pub.dartlang.org/convert-2.0.1/lib/src/hex.dart');
            assertAsRelativePath(ws, '', '');
            assertAsRelativePath(ws, '/foo/bar', '/foo/bar');
            assertAsRelativePath(ws, 'in/out', 'in/out');
        });
        test('asRelativePath, same paths, #11402', function () {
            const root = '/home/aeschli/workspaces/samples/docker';
            const input = '/home/aeschli/workspaces/samples/docker';
            const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            assertAsRelativePath(ws, input, input);
            const input2 = '/home/aeschli/workspaces/samples/docker/a.file';
            assertAsRelativePath(ws, input2, 'a.file');
        });
        test('asRelativePath, no workspace', function () {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), null, new log_1.$fj());
            assertAsRelativePath(ws, '', '');
            assertAsRelativePath(ws, '/foo/bar', '/foo/bar');
        });
        test('asRelativePath, multiple folders', function () {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0), aWorkspaceFolderData(uri_1.URI.file('/Coding/Two'), 1)], name: 'Test' }, new log_1.$fj());
            assertAsRelativePath(ws, '/Coding/One/file.txt', 'One/file.txt');
            assertAsRelativePath(ws, '/Coding/Two/files/out.txt', 'Two/files/out.txt');
            assertAsRelativePath(ws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt');
        });
        test('slightly inconsistent behaviour of asRelativePath and getWorkspaceFolder, #31553', function () {
            const mrws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0), aWorkspaceFolderData(uri_1.URI.file('/Coding/Two'), 1)], name: 'Test' }, new log_1.$fj());
            assertAsRelativePath(mrws, '/Coding/One/file.txt', 'One/file.txt');
            assertAsRelativePath(mrws, '/Coding/One/file.txt', 'One/file.txt', true);
            assertAsRelativePath(mrws, '/Coding/One/file.txt', 'file.txt', false);
            assertAsRelativePath(mrws, '/Coding/Two/files/out.txt', 'Two/files/out.txt');
            assertAsRelativePath(mrws, '/Coding/Two/files/out.txt', 'Two/files/out.txt', true);
            assertAsRelativePath(mrws, '/Coding/Two/files/out.txt', 'files/out.txt', false);
            assertAsRelativePath(mrws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt');
            assertAsRelativePath(mrws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', true);
            assertAsRelativePath(mrws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', false);
            const srws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0)], name: 'Test' }, new log_1.$fj());
            assertAsRelativePath(srws, '/Coding/One/file.txt', 'file.txt');
            assertAsRelativePath(srws, '/Coding/One/file.txt', 'file.txt', false);
            assertAsRelativePath(srws, '/Coding/One/file.txt', 'One/file.txt', true);
            assertAsRelativePath(srws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt');
            assertAsRelativePath(srws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', true);
            assertAsRelativePath(srws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', false);
        });
        test('getPath, legacy', function () {
            let ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', name: 'Test', folders: [] }, new log_1.$fj());
            assert.strictEqual(ws.getPath(), undefined);
            ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), null, new log_1.$fj());
            assert.strictEqual(ws.getPath(), undefined);
            ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), undefined, new log_1.$fj());
            assert.strictEqual(ws.getPath(), undefined);
            ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.file('Folder'), 0), aWorkspaceFolderData(uri_1.URI.file('Another/Folder'), 1)] }, new log_1.$fj());
            assert.strictEqual(ws.getPath().replace(/\\/g, '/'), '/Folder');
            ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.file('/Folder'), 0)] }, new log_1.$fj());
            assert.strictEqual(ws.getPath().replace(/\\/g, '/'), '/Folder');
        });
        test('WorkspaceFolder has name and index', function () {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0), aWorkspaceFolderData(uri_1.URI.file('/Coding/Two'), 1)], name: 'Test' }, new log_1.$fj());
            const [one, two] = ws.getWorkspaceFolders();
            assert.strictEqual(one.name, 'One');
            assert.strictEqual(one.index, 0);
            assert.strictEqual(two.name, 'Two');
            assert.strictEqual(two.index, 1);
        });
        test('getContainingWorkspaceFolder', () => {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), {
                id: 'foo',
                name: 'Test',
                folders: [
                    aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0),
                    aWorkspaceFolderData(uri_1.URI.file('/Coding/Two'), 1),
                    aWorkspaceFolderData(uri_1.URI.file('/Coding/Two/Nested'), 2)
                ]
            }, new log_1.$fj());
            let folder = ws.getWorkspaceFolder(uri_1.URI.file('/foo/bar'));
            assert.strictEqual(folder, undefined);
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/One/file/path.txt'));
            assert.strictEqual(folder.name, 'One');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/file/path.txt'));
            assert.strictEqual(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nest'));
            assert.strictEqual(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested/file'));
            assert.strictEqual(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested/f'));
            assert.strictEqual(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested'), true);
            assert.strictEqual(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested/'), true);
            assert.strictEqual(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested'));
            assert.strictEqual(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested/'));
            assert.strictEqual(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two'), true);
            assert.strictEqual(folder, undefined);
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two'), false);
            assert.strictEqual(folder.name, 'Two');
        });
        test('Multiroot change event should have a delta, #29641', function (done) {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', name: 'Test', folders: [] }, new log_1.$fj());
            let finished = false;
            const finish = (error) => {
                if (!finished) {
                    finished = true;
                    done(error);
                }
            };
            let sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.added, []);
                    assert.deepStrictEqual(e.removed, []);
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [] });
            sub.dispose();
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.removed, []);
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar');
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0)] });
            sub.dispose();
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.removed, []);
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar2');
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar2'), 1)] });
            sub.dispose();
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.strictEqual(e.removed.length, 2);
                    assert.strictEqual(e.removed[0].uri.toString(), 'foo:bar');
                    assert.strictEqual(e.removed[1].uri.toString(), 'foo:bar2');
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar3');
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0)] });
            sub.dispose();
            finish();
        });
        test('Multiroot change keeps existing workspaces live', function () {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0)] }, new log_1.$fj());
            const firstFolder = ws.getWorkspaceFolders()[0];
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar2'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 1, 'renamed')] });
            assert.strictEqual(ws.getWorkspaceFolders()[1], firstFolder);
            assert.strictEqual(firstFolder.index, 1);
            assert.strictEqual(firstFolder.name, 'renamed');
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar2'), 1), aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 2)] });
            assert.strictEqual(ws.getWorkspaceFolders()[2], firstFolder);
            assert.strictEqual(firstFolder.index, 2);
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0)] });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 1)] });
            assert.notStrictEqual(firstFolder, ws.workspace.folders[0]);
        });
        test('updateWorkspaceFolders - invalid arguments', function () {
            let ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', name: 'Test', folders: [] }, new log_1.$fj());
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.$KF, null, null));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.$KF, 0, 0));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.$KF, 0, 1));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.$KF, 1, 0));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.$KF, -1, 0));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.$KF, -1, -1));
            ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0)] }, new log_1.$fj());
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.$KF, 1, 1));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.$KF, 0, 2));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.$KF, 0, 1, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar'))));
        });
        test('updateWorkspaceFolders - valid arguments', function (done) {
            let finished = false;
            const finish = (error) => {
                if (!finished) {
                    finished = true;
                    done(error);
                }
            };
            const protocol = {
                getProxy: () => { return undefined; },
                set: () => { return undefined; },
                dispose: () => { },
                assertRegistered: () => { },
                drain: () => { return undefined; },
            };
            const ws = createExtHostWorkspace(protocol, { id: 'foo', name: 'Test', folders: [] }, new log_1.$fj());
            //
            // Add one folder
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.$KF, 0, 0, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar'))));
            assert.strictEqual(1, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar').toString());
            const firstAddedFolder = ws.getWorkspaceFolders()[0];
            let gotEvent = false;
            let sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.removed, []);
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar');
                    assert.strictEqual(e.added[0], firstAddedFolder); // verify object is still live
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            //
            // Add two more folders
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.$KF, 1, 0, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar1')), asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar2'))));
            assert.strictEqual(3, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar1').toString());
            assert.strictEqual(ws.workspace.folders[2].uri.toString(), uri_1.URI.parse('foo:bar2').toString());
            const secondAddedFolder = ws.getWorkspaceFolders()[1];
            const thirdAddedFolder = ws.getWorkspaceFolders()[2];
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.removed, []);
                    assert.strictEqual(e.added.length, 2);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar1');
                    assert.strictEqual(e.added[1].uri.toString(), 'foo:bar2');
                    assert.strictEqual(e.added[0], secondAddedFolder);
                    assert.strictEqual(e.added[1], thirdAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar1'), 1), aWorkspaceFolderData(uri_1.URI.parse('foo:bar2'), 2)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], secondAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[2], thirdAddedFolder); // verify object is still live
            //
            // Remove one folder
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.$KF, 2, 1));
            assert.strictEqual(2, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar1').toString());
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.added, []);
                    assert.strictEqual(e.removed.length, 1);
                    assert.strictEqual(e.removed[0], thirdAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar1'), 1)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], secondAddedFolder); // verify object is still live
            //
            // Rename folder
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.$KF, 0, 2, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 'renamed 1'), asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar1'), 'renamed 2')));
            assert.strictEqual(2, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar1').toString());
            assert.strictEqual(ws.workspace.folders[0].name, 'renamed 1');
            assert.strictEqual(ws.workspace.folders[1].name, 'renamed 2');
            assert.strictEqual(ws.getWorkspaceFolders()[0].name, 'renamed 1');
            assert.strictEqual(ws.getWorkspaceFolders()[1].name, 'renamed 2');
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.added, []);
                    assert.strictEqual(e.removed.length, 0);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0, 'renamed 1'), aWorkspaceFolderData(uri_1.URI.parse('foo:bar1'), 1, 'renamed 2')] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], secondAddedFolder); // verify object is still live
            assert.strictEqual(ws.workspace.folders[0].name, 'renamed 1');
            assert.strictEqual(ws.workspace.folders[1].name, 'renamed 2');
            assert.strictEqual(ws.getWorkspaceFolders()[0].name, 'renamed 1');
            assert.strictEqual(ws.getWorkspaceFolders()[1].name, 'renamed 2');
            //
            // Add and remove folders
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.$KF, 0, 2, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar3')), asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar4'))));
            assert.strictEqual(2, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar3').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar4').toString());
            const fourthAddedFolder = ws.getWorkspaceFolders()[0];
            const fifthAddedFolder = ws.getWorkspaceFolders()[1];
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.strictEqual(e.added.length, 2);
                    assert.strictEqual(e.added[0], fourthAddedFolder);
                    assert.strictEqual(e.added[1], fifthAddedFolder);
                    assert.strictEqual(e.removed.length, 2);
                    assert.strictEqual(e.removed[0], firstAddedFolder);
                    assert.strictEqual(e.removed[1], secondAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar4'), 1)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], fourthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], fifthAddedFolder); // verify object is still live
            //
            // Swap folders
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.$KF, 0, 2, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar4')), asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar3'))));
            assert.strictEqual(2, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar4').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar3').toString());
            assert.strictEqual(ws.getWorkspaceFolders()[0], fifthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], fourthAddedFolder); // verify object is still live
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.strictEqual(e.added.length, 0);
                    assert.strictEqual(e.removed.length, 0);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar4'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 1)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], fifthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], fourthAddedFolder); // verify object is still live
            assert.strictEqual(fifthAddedFolder.index, 0);
            assert.strictEqual(fourthAddedFolder.index, 1);
            //
            // Add one folder after the other without waiting for confirmation (not supported currently)
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.$KF, 2, 0, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar5'))));
            assert.strictEqual(3, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar4').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar3').toString());
            assert.strictEqual(ws.workspace.folders[2].uri.toString(), uri_1.URI.parse('foo:bar5').toString());
            const sixthAddedFolder = ws.getWorkspaceFolders()[2];
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0], sixthAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({
                id: 'foo', name: 'Test', folders: [
                    aWorkspaceFolderData(uri_1.URI.parse('foo:bar4'), 0),
                    aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 1),
                    aWorkspaceFolderData(uri_1.URI.parse('foo:bar5'), 2)
                ]
            }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], fifthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], fourthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[2], sixthAddedFolder); // verify object is still live
            finish();
        });
        test('Multiroot change event is immutable', function (done) {
            let finished = false;
            const finish = (error) => {
                if (!finished) {
                    finished = true;
                    done(error);
                }
            };
            const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), { id: 'foo', name: 'Test', folders: [] }, new log_1.$fj());
            const sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.throws(() => {
                        e.added = [];
                    });
                    // assert.throws(() => {
                    // 	(<any>e.added)[0] = null;
                    // });
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [] });
            sub.dispose();
            finish();
        });
        test('`vscode.workspace.getWorkspaceFolder(file)` don\'t return workspace folder when file open from command line. #36221', function () {
            if (platform_1.$i) {
                const ws = createExtHostWorkspace(new testRPCProtocol_1.$3dc(), {
                    id: 'foo', name: 'Test', folders: [
                        aWorkspaceFolderData(uri_1.URI.file('c:/Users/marek/Desktop/vsc_test/'), 0)
                    ]
                }, new log_1.$fj());
                assert.ok(ws.getWorkspaceFolder(uri_1.URI.file('c:/Users/marek/Desktop/vsc_test/a.txt')));
                assert.ok(ws.getWorkspaceFolder(uri_1.URI.file('C:/Users/marek/Desktop/vsc_test/b.txt')));
            }
        });
        function aWorkspaceFolderData(uri, index, name = '') {
            return {
                uri,
                index,
                name: name || (0, path_1.$ae)(uri.path)
            };
        }
        function asUpdateWorkspaceFolderData(uri, name) {
            return { uri, name };
        }
        test('findFiles - string include', () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(includePattern, 'foo');
                    assert.strictEqual(_includeFolder, null);
                    assert.strictEqual(excludePatternOrDisregardExcludes, null);
                    assert.strictEqual(maxResults, 10);
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            return ws.findFiles('foo', undefined, 10, new extensions_1.$Vl('test')).then(() => {
                assert(mainThreadCalled, 'mainThreadCalled');
            });
        });
        function testFindFilesInclude(pattern) {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(includePattern, 'glob/**');
                    assert.deepStrictEqual(_includeFolder ? uri_1.URI.from(_includeFolder).toJSON() : null, uri_1.URI.file('/other/folder').toJSON());
                    assert.strictEqual(excludePatternOrDisregardExcludes, null);
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            return ws.findFiles(pattern, undefined, 10, new extensions_1.$Vl('test')).then(() => {
                assert(mainThreadCalled, 'mainThreadCalled');
            });
        }
        test('findFiles - RelativePattern include (string)', () => {
            return testFindFilesInclude(new extHostTypes_1.$YK('/other/folder', 'glob/**'));
        });
        test('findFiles - RelativePattern include (URI)', () => {
            return testFindFilesInclude(new extHostTypes_1.$YK(uri_1.URI.file('/other/folder'), 'glob/**'));
        });
        test('findFiles - no excludes', () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(includePattern, 'glob/**');
                    assert.deepStrictEqual(uri_1.URI.revive(_includeFolder).toString(), uri_1.URI.file('/other/folder').toString());
                    assert.strictEqual(excludePatternOrDisregardExcludes, false);
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            return ws.findFiles(new extHostTypes_1.$YK('/other/folder', 'glob/**'), null, 10, new extensions_1.$Vl('test')).then(() => {
                assert(mainThreadCalled, 'mainThreadCalled');
            });
        });
        test('findFiles - with cancelled token', () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            const token = cancellation_1.CancellationToken.Cancelled;
            return ws.findFiles(new extHostTypes_1.$YK('/other/folder', 'glob/**'), null, 10, new extensions_1.$Vl('test'), token).then(() => {
                assert(!mainThreadCalled, '!mainThreadCalled');
            });
        });
        test('findFiles - RelativePattern exclude', () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    assert(excludePatternOrDisregardExcludes, 'glob/**'); // Note that the base portion is ignored, see #52651
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            return ws.findFiles('', new extHostTypes_1.$YK(root, 'glob/**'), 10, new extensions_1.$Vl('test')).then(() => {
                assert(mainThreadCalled, 'mainThreadCalled');
            });
        });
        test('findTextInFiles - no include', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(query.pattern, 'foo');
                    assert.strictEqual(folder, null);
                    assert.strictEqual(options.includePattern, undefined);
                    assert.strictEqual(options.excludePattern, undefined);
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            await ws.findTextInFiles({ pattern: 'foo' }, {}, () => { }, new extensions_1.$Vl('test'));
            assert(mainThreadCalled, 'mainThreadCalled');
        });
        test('findTextInFiles - string include', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(query.pattern, 'foo');
                    assert.strictEqual(folder, null);
                    assert.strictEqual(options.includePattern, '**/files');
                    assert.strictEqual(options.excludePattern, undefined);
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            await ws.findTextInFiles({ pattern: 'foo' }, { include: '**/files' }, () => { }, new extensions_1.$Vl('test'));
            assert(mainThreadCalled, 'mainThreadCalled');
        });
        test('findTextInFiles - RelativePattern include', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(query.pattern, 'foo');
                    assert.deepStrictEqual(uri_1.URI.revive(folder).toString(), uri_1.URI.file('/other/folder').toString());
                    assert.strictEqual(options.includePattern, 'glob/**');
                    assert.strictEqual(options.excludePattern, undefined);
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            await ws.findTextInFiles({ pattern: 'foo' }, { include: new extHostTypes_1.$YK('/other/folder', 'glob/**') }, () => { }, new extensions_1.$Vl('test'));
            assert(mainThreadCalled, 'mainThreadCalled');
        });
        test('findTextInFiles - with cancelled token', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            const token = cancellation_1.CancellationToken.Cancelled;
            await ws.findTextInFiles({ pattern: 'foo' }, {}, () => { }, new extensions_1.$Vl('test'), token);
            assert(!mainThreadCalled, '!mainThreadCalled');
        });
        test('findTextInFiles - RelativePattern exclude', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.$3dc();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.$1J.MainThreadWorkspace, new class extends (0, mock_1.$rT)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(query.pattern, 'foo');
                    assert.deepStrictEqual(folder, null);
                    assert.strictEqual(options.includePattern, undefined);
                    assert.strictEqual(options.excludePattern, 'glob/**'); // exclude folder is ignored...
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.$fj());
            await ws.findTextInFiles({ pattern: 'foo' }, { exclude: new extHostTypes_1.$YK('/other/folder', 'glob/**') }, () => { }, new extensions_1.$Vl('test'));
            assert(mainThreadCalled, 'mainThreadCalled');
        });
    });
});
//# sourceMappingURL=extHostWorkspace.test.js.map