/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/indexedDB", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/base/test/common/testUtils", "vs/platform/files/browser/indexedDBFileSystemProvider", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/log/common/log"], function (require, exports, assert, indexedDB_1, buffer_1, lifecycle_1, network_1, resources_1, uri_1, testUtils_1, indexedDBFileSystemProvider_1, files_1, fileService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('IndexedDBFileSystemProvider', function () {
        let service;
        let userdataFileProvider;
        const testDir = '/';
        const userdataURIFromPaths = (paths) => (0, resources_1.joinPath)(uri_1.URI.from({ scheme: network_1.Schemas.vscodeUserData, path: testDir }), ...paths);
        const disposables = new lifecycle_1.DisposableStore();
        const initFixtures = async () => {
            await Promise.all([['fixtures', 'resolver', 'examples'],
                ['fixtures', 'resolver', 'other', 'deep'],
                ['fixtures', 'service', 'deep'],
                ['batched']]
                .map(path => userdataURIFromPaths(path))
                .map(uri => service.createFolder(uri)));
            await Promise.all([
                [['fixtures', 'resolver', 'examples', 'company.js'], 'class company {}'],
                [['fixtures', 'resolver', 'examples', 'conway.js'], 'export function conway() {}'],
                [['fixtures', 'resolver', 'examples', 'employee.js'], 'export const employee = "jax"'],
                [['fixtures', 'resolver', 'examples', 'small.js'], ''],
                [['fixtures', 'resolver', 'other', 'deep', 'company.js'], 'class company {}'],
                [['fixtures', 'resolver', 'other', 'deep', 'conway.js'], 'export function conway() {}'],
                [['fixtures', 'resolver', 'other', 'deep', 'employee.js'], 'export const employee = "jax"'],
                [['fixtures', 'resolver', 'other', 'deep', 'small.js'], ''],
                [['fixtures', 'resolver', 'index.html'], '<p>p</p>'],
                [['fixtures', 'resolver', 'site.css'], '.p {color: red;}'],
                [['fixtures', 'service', 'deep', 'company.js'], 'class company {}'],
                [['fixtures', 'service', 'deep', 'conway.js'], 'export function conway() {}'],
                [['fixtures', 'service', 'deep', 'employee.js'], 'export const employee = "jax"'],
                [['fixtures', 'service', 'deep', 'small.js'], ''],
                [['fixtures', 'service', 'binary.txt'], '<p>p</p>'],
            ]
                .map(([path, contents]) => [userdataURIFromPaths(path), contents])
                .map(([uri, contents]) => service.createFile(uri, buffer_1.VSBuffer.fromString(contents))));
        };
        const reload = async () => {
            const logService = new log_1.NullLogService();
            service = new fileService_1.FileService(logService);
            disposables.add(service);
            const indexedDB = await indexedDB_1.IndexedDB.create('vscode-web-db-test', 1, ['vscode-userdata-store', 'vscode-logs-store']);
            userdataFileProvider = new indexedDBFileSystemProvider_1.IndexedDBFileSystemProvider(network_1.Schemas.vscodeUserData, indexedDB, 'vscode-userdata-store', true);
            disposables.add(service.registerProvider(network_1.Schemas.vscodeUserData, userdataFileProvider));
            disposables.add(userdataFileProvider);
        };
        setup(async function () {
            this.timeout(15000);
            await reload();
        });
        teardown(async () => {
            await userdataFileProvider.reset();
            disposables.clear();
        });
        test('root is always present', async () => {
            assert.strictEqual((await userdataFileProvider.stat(userdataURIFromPaths([]))).type, files_1.FileType.Directory);
            await userdataFileProvider.delete(userdataURIFromPaths([]), { recursive: true, useTrash: false, atomic: false });
            assert.strictEqual((await userdataFileProvider.stat(userdataURIFromPaths([]))).type, files_1.FileType.Directory);
        });
        test('createFolder', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const parent = await service.resolve(userdataURIFromPaths([]));
            const newFolderResource = (0, resources_1.joinPath)(parent.resource, 'newFolder');
            assert.strictEqual((await userdataFileProvider.readdir(parent.resource)).length, 0);
            const newFolder = await service.createFolder(newFolderResource);
            assert.strictEqual(newFolder.name, 'newFolder');
            assert.strictEqual((await userdataFileProvider.readdir(parent.resource)).length, 1);
            assert.strictEqual((await userdataFileProvider.stat(newFolderResource)).type, files_1.FileType.Directory);
            assert.ok(event);
            assert.strictEqual(event.resource.path, newFolderResource.path);
            assert.strictEqual(event.operation, 0 /* FileOperation.CREATE */);
            assert.strictEqual(event.target.resource.path, newFolderResource.path);
            assert.strictEqual(event.target.isDirectory, true);
        });
        test('createFolder: creating multiple folders at once', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const multiFolderPaths = ['a', 'couple', 'of', 'folders'];
            const parent = await service.resolve(userdataURIFromPaths([]));
            const newFolderResource = (0, resources_1.joinPath)(parent.resource, ...multiFolderPaths);
            const newFolder = await service.createFolder(newFolderResource);
            const lastFolderName = multiFolderPaths[multiFolderPaths.length - 1];
            assert.strictEqual(newFolder.name, lastFolderName);
            assert.strictEqual((await userdataFileProvider.stat(newFolderResource)).type, files_1.FileType.Directory);
            assert.ok(event);
            assert.strictEqual(event.resource.path, newFolderResource.path);
            assert.strictEqual(event.operation, 0 /* FileOperation.CREATE */);
            assert.strictEqual(event.target.resource.path, newFolderResource.path);
            assert.strictEqual(event.target.isDirectory, true);
        });
        test('exists', async () => {
            let exists = await service.exists(userdataURIFromPaths([]));
            assert.strictEqual(exists, true);
            exists = await service.exists(userdataURIFromPaths(['hello']));
            assert.strictEqual(exists, false);
        });
        test('resolve - file', async () => {
            await initFixtures();
            const resource = userdataURIFromPaths(['fixtures', 'resolver', 'index.html']);
            const resolved = await service.resolve(resource);
            assert.strictEqual(resolved.name, 'index.html');
            assert.strictEqual(resolved.isFile, true);
            assert.strictEqual(resolved.isDirectory, false);
            assert.strictEqual(resolved.isSymbolicLink, false);
            assert.strictEqual(resolved.resource.toString(), resource.toString());
            assert.strictEqual(resolved.children, undefined);
            assert.ok(resolved.size > 0);
        });
        test('resolve - directory', async () => {
            await initFixtures();
            const testsElements = ['examples', 'other', 'index.html', 'site.css'];
            const resource = userdataURIFromPaths(['fixtures', 'resolver']);
            const result = await service.resolve(resource);
            assert.ok(result);
            assert.strictEqual(result.resource.toString(), resource.toString());
            assert.strictEqual(result.name, 'resolver');
            assert.ok(result.children);
            assert.ok(result.children.length > 0);
            assert.ok(result.isDirectory);
            assert.strictEqual(result.children.length, testsElements.length);
            assert.ok(result.children.every(entry => {
                return testsElements.some(name => {
                    return (0, resources_1.basename)(entry.resource) === name;
                });
            }));
            result.children.forEach(value => {
                assert.ok((0, resources_1.basename)(value.resource));
                if (['examples', 'other'].indexOf((0, resources_1.basename)(value.resource)) >= 0) {
                    assert.ok(value.isDirectory);
                    assert.strictEqual(value.mtime, undefined);
                    assert.strictEqual(value.ctime, undefined);
                }
                else if ((0, resources_1.basename)(value.resource) === 'index.html') {
                    assert.ok(!value.isDirectory);
                    assert.ok(!value.children);
                    assert.strictEqual(value.mtime, undefined);
                    assert.strictEqual(value.ctime, undefined);
                }
                else if ((0, resources_1.basename)(value.resource) === 'site.css') {
                    assert.ok(!value.isDirectory);
                    assert.ok(!value.children);
                    assert.strictEqual(value.mtime, undefined);
                    assert.strictEqual(value.ctime, undefined);
                }
                else {
                    assert.ok(!'Unexpected value ' + (0, resources_1.basename)(value.resource));
                }
            });
        });
        test('createFile', async () => {
            return assertCreateFile(contents => buffer_1.VSBuffer.fromString(contents));
        });
        test('createFile (readable)', async () => {
            return assertCreateFile(contents => (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString(contents)));
        });
        test('createFile (stream)', async () => {
            return assertCreateFile(contents => (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString(contents)));
        });
        async function assertCreateFile(converter) {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const contents = 'Hello World';
            const resource = userdataURIFromPaths(['test.txt']);
            assert.strictEqual(await service.canCreateFile(resource), true);
            const fileStat = await service.createFile(resource, converter(contents));
            assert.strictEqual(fileStat.name, 'test.txt');
            assert.strictEqual((await userdataFileProvider.stat(fileStat.resource)).type, files_1.FileType.File);
            assert.strictEqual(new TextDecoder().decode(await userdataFileProvider.readFile(fileStat.resource)), contents);
            assert.ok(event);
            assert.strictEqual(event.resource.path, resource.path);
            assert.strictEqual(event.operation, 0 /* FileOperation.CREATE */);
            assert.strictEqual(event.target.resource.path, resource.path);
        }
        const fileCreateBatchTester = (size, name) => {
            const batch = Array.from({ length: size }).map((_, i) => ({ contents: `Hello${i}`, resource: userdataURIFromPaths(['batched', name, `Hello${i}.txt`]) }));
            let creationPromises = undefined;
            return {
                async create() {
                    return creationPromises = Promise.all(batch.map(entry => userdataFileProvider.writeFile(entry.resource, buffer_1.VSBuffer.fromString(entry.contents).buffer, { create: true, overwrite: true, unlock: false, atomic: false })));
                },
                async assertContentsCorrect() {
                    if (!creationPromises) {
                        throw Error('read called before create');
                    }
                    await creationPromises;
                    await Promise.all(batch.map(async (entry, i) => {
                        assert.strictEqual((await userdataFileProvider.stat(entry.resource)).type, files_1.FileType.File);
                        assert.strictEqual(new TextDecoder().decode(await userdataFileProvider.readFile(entry.resource)), entry.contents);
                    }));
                }
            };
        };
        test('createFile - batch', async () => {
            const tester = fileCreateBatchTester(20, 'batch');
            await tester.create();
            await tester.assertContentsCorrect();
        });
        test('createFile - batch (mixed parallel/sequential)', async () => {
            const batch1 = fileCreateBatchTester(1, 'batch1');
            const batch2 = fileCreateBatchTester(20, 'batch2');
            const batch3 = fileCreateBatchTester(1, 'batch3');
            const batch4 = fileCreateBatchTester(20, 'batch4');
            batch1.create();
            batch2.create();
            await Promise.all([batch1.assertContentsCorrect(), batch2.assertContentsCorrect()]);
            batch3.create();
            batch4.create();
            await Promise.all([batch3.assertContentsCorrect(), batch4.assertContentsCorrect()]);
            await Promise.all([batch1.assertContentsCorrect(), batch2.assertContentsCorrect()]);
        });
        test('rename not existing resource', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFile = (0, resources_1.joinPath)(parent.resource, 'sourceFile');
            const targetFile = (0, resources_1.joinPath)(parent.resource, 'targetFile');
            try {
                await service.move(sourceFile, targetFile, false);
            }
            catch (error) {
                assert.deepStrictEqual(error.code, files_1.FileSystemProviderErrorCode.FileNotFound);
                return;
            }
            assert.fail('This should fail with error');
        });
        test('rename to an existing file without overwrite', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFile = (0, resources_1.joinPath)(parent.resource, 'sourceFile');
            await service.writeFile(sourceFile, buffer_1.VSBuffer.fromString('This is source file'));
            const targetFile = (0, resources_1.joinPath)(parent.resource, 'targetFile');
            await service.writeFile(targetFile, buffer_1.VSBuffer.fromString('This is target file'));
            try {
                await service.move(sourceFile, targetFile, false);
            }
            catch (error) {
                assert.deepStrictEqual(error.fileOperationResult, 4 /* FileOperationResult.FILE_MOVE_CONFLICT */);
                return;
            }
            assert.fail('This should fail with error');
        });
        test('rename folder to an existing folder without overwrite', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFolder = (0, resources_1.joinPath)(parent.resource, 'sourceFolder');
            await service.createFolder(sourceFolder);
            const targetFolder = (0, resources_1.joinPath)(parent.resource, 'targetFolder');
            await service.createFolder(targetFolder);
            try {
                await service.move(sourceFolder, targetFolder, false);
            }
            catch (error) {
                assert.deepStrictEqual(error.fileOperationResult, 4 /* FileOperationResult.FILE_MOVE_CONFLICT */);
                return;
            }
            assert.fail('This should fail with cannot overwrite error');
        });
        test('rename file to a folder', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFile = (0, resources_1.joinPath)(parent.resource, 'sourceFile');
            await service.writeFile(sourceFile, buffer_1.VSBuffer.fromString('This is source file'));
            const targetFolder = (0, resources_1.joinPath)(parent.resource, 'targetFolder');
            await service.createFolder(targetFolder);
            try {
                await service.move(sourceFile, targetFolder, false);
            }
            catch (error) {
                assert.deepStrictEqual(error.fileOperationResult, 4 /* FileOperationResult.FILE_MOVE_CONFLICT */);
                return;
            }
            assert.fail('This should fail with error');
        });
        test('rename folder to a file', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFolder = (0, resources_1.joinPath)(parent.resource, 'sourceFile');
            await service.createFolder(sourceFolder);
            const targetFile = (0, resources_1.joinPath)(parent.resource, 'targetFile');
            await service.writeFile(targetFile, buffer_1.VSBuffer.fromString('This is target file'));
            try {
                await service.move(sourceFolder, targetFile, false);
            }
            catch (error) {
                assert.deepStrictEqual(error.fileOperationResult, 4 /* FileOperationResult.FILE_MOVE_CONFLICT */);
                return;
            }
            assert.fail('This should fail with error');
        });
        test('rename file', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFile = (0, resources_1.joinPath)(parent.resource, 'sourceFile');
            await service.writeFile(sourceFile, buffer_1.VSBuffer.fromString('This is source file'));
            const targetFile = (0, resources_1.joinPath)(parent.resource, 'targetFile');
            await service.move(sourceFile, targetFile, false);
            const content = await service.readFile(targetFile);
            assert.strictEqual(await service.exists(sourceFile), false);
            assert.strictEqual(content.value.toString(), 'This is source file');
        });
        test('rename to an existing file with overwrite', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFile = (0, resources_1.joinPath)(parent.resource, 'sourceFile');
            const targetFile = (0, resources_1.joinPath)(parent.resource, 'targetFile');
            await Promise.all([
                service.writeFile(sourceFile, buffer_1.VSBuffer.fromString('This is source file')),
                service.writeFile(targetFile, buffer_1.VSBuffer.fromString('This is target file'))
            ]);
            await service.move(sourceFile, targetFile, true);
            const content = await service.readFile(targetFile);
            assert.strictEqual(await service.exists(sourceFile), false);
            assert.strictEqual(content.value.toString(), 'This is source file');
        });
        test('rename folder to a new folder', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFolder = (0, resources_1.joinPath)(parent.resource, 'sourceFolder');
            await service.createFolder(sourceFolder);
            const targetFolder = (0, resources_1.joinPath)(parent.resource, 'targetFolder');
            await service.move(sourceFolder, targetFolder, false);
            assert.deepStrictEqual(await service.exists(sourceFolder), false);
            assert.deepStrictEqual(await service.exists(targetFolder), true);
        });
        test('rename folder to an existing folder', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFolder = (0, resources_1.joinPath)(parent.resource, 'sourceFolder');
            await service.createFolder(sourceFolder);
            const targetFolder = (0, resources_1.joinPath)(parent.resource, 'targetFolder');
            await service.createFolder(targetFolder);
            await service.move(sourceFolder, targetFolder, true);
            assert.deepStrictEqual(await service.exists(sourceFolder), false);
            assert.deepStrictEqual(await service.exists(targetFolder), true);
        });
        test('rename a folder that has multiple files and folders', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFolder = (0, resources_1.joinPath)(parent.resource, 'sourceFolder');
            const sourceFile1 = (0, resources_1.joinPath)(sourceFolder, 'folder1', 'file1');
            const sourceFile2 = (0, resources_1.joinPath)(sourceFolder, 'folder2', 'file1');
            const sourceEmptyFolder = (0, resources_1.joinPath)(sourceFolder, 'folder3');
            await Promise.all([
                service.writeFile(sourceFile1, buffer_1.VSBuffer.fromString('Source File 1')),
                service.writeFile(sourceFile2, buffer_1.VSBuffer.fromString('Source File 2')),
                service.createFolder(sourceEmptyFolder)
            ]);
            const targetFolder = (0, resources_1.joinPath)(parent.resource, 'targetFolder');
            const targetFile1 = (0, resources_1.joinPath)(targetFolder, 'folder1', 'file1');
            const targetFile2 = (0, resources_1.joinPath)(targetFolder, 'folder2', 'file1');
            const targetEmptyFolder = (0, resources_1.joinPath)(targetFolder, 'folder3');
            await service.move(sourceFolder, targetFolder, false);
            assert.deepStrictEqual(await service.exists(sourceFolder), false);
            assert.deepStrictEqual(await service.exists(targetFolder), true);
            assert.strictEqual((await service.readFile(targetFile1)).value.toString(), 'Source File 1');
            assert.strictEqual((await service.readFile(targetFile2)).value.toString(), 'Source File 2');
            assert.deepStrictEqual(await service.exists(targetEmptyFolder), true);
        });
        test('rename a folder to another folder that has some files', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const sourceFolder = (0, resources_1.joinPath)(parent.resource, 'sourceFolder');
            const sourceFile1 = (0, resources_1.joinPath)(sourceFolder, 'folder1', 'file1');
            const targetFolder = (0, resources_1.joinPath)(parent.resource, 'targetFolder');
            const targetFile1 = (0, resources_1.joinPath)(targetFolder, 'folder1', 'file1');
            const targetFile2 = (0, resources_1.joinPath)(targetFolder, 'folder1', 'file2');
            const targetFile3 = (0, resources_1.joinPath)(targetFolder, 'folder2', 'file1');
            await Promise.all([
                service.writeFile(sourceFile1, buffer_1.VSBuffer.fromString('Source File 1')),
                service.writeFile(targetFile2, buffer_1.VSBuffer.fromString('Target File 2')),
                service.writeFile(targetFile3, buffer_1.VSBuffer.fromString('Target File 3'))
            ]);
            await service.move(sourceFolder, targetFolder, true);
            assert.deepStrictEqual(await service.exists(sourceFolder), false);
            assert.deepStrictEqual(await service.exists(targetFolder), true);
            assert.strictEqual((await service.readFile(targetFile1)).value.toString(), 'Source File 1');
            assert.strictEqual(await service.exists(targetFile2), false);
            assert.strictEqual(await service.exists(targetFile3), false);
        });
        test('deleteFile', async () => {
            await initFixtures();
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const anotherResource = userdataURIFromPaths(['fixtures', 'service', 'deep', 'company.js']);
            const resource = userdataURIFromPaths(['fixtures', 'service', 'deep', 'conway.js']);
            const source = await service.resolve(resource);
            assert.strictEqual(await service.canDelete(source.resource, { useTrash: false }), true);
            await service.del(source.resource, { useTrash: false });
            assert.strictEqual(await service.exists(source.resource), false);
            assert.strictEqual(await service.exists(anotherResource), true);
            assert.ok(event);
            assert.strictEqual(event.resource.path, resource.path);
            assert.strictEqual(event.operation, 1 /* FileOperation.DELETE */);
            {
                let error = undefined;
                try {
                    await service.del(source.resource, { useTrash: false });
                }
                catch (e) {
                    error = e;
                }
                assert.ok(error);
                assert.strictEqual(error.fileOperationResult, 1 /* FileOperationResult.FILE_NOT_FOUND */);
            }
            await reload();
            {
                let error = undefined;
                try {
                    await service.del(source.resource, { useTrash: false });
                }
                catch (e) {
                    error = e;
                }
                assert.ok(error);
                assert.strictEqual(error.fileOperationResult, 1 /* FileOperationResult.FILE_NOT_FOUND */);
            }
        });
        test('deleteFolder (recursive)', async () => {
            await initFixtures();
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const resource = userdataURIFromPaths(['fixtures', 'service', 'deep']);
            const subResource1 = userdataURIFromPaths(['fixtures', 'service', 'deep', 'company.js']);
            const subResource2 = userdataURIFromPaths(['fixtures', 'service', 'deep', 'conway.js']);
            assert.strictEqual(await service.exists(subResource1), true);
            assert.strictEqual(await service.exists(subResource2), true);
            const source = await service.resolve(resource);
            assert.strictEqual(await service.canDelete(source.resource, { recursive: true, useTrash: false }), true);
            await service.del(source.resource, { recursive: true, useTrash: false });
            assert.strictEqual(await service.exists(source.resource), false);
            assert.strictEqual(await service.exists(subResource1), false);
            assert.strictEqual(await service.exists(subResource2), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, resource.fsPath);
            assert.strictEqual(event.operation, 1 /* FileOperation.DELETE */);
        });
        test('deleteFolder (non recursive)', async () => {
            await initFixtures();
            const resource = userdataURIFromPaths(['fixtures', 'service', 'deep']);
            const source = await service.resolve(resource);
            assert.ok((await service.canDelete(source.resource)) instanceof Error);
            let error;
            try {
                await service.del(source.resource);
            }
            catch (e) {
                error = e;
            }
            assert.ok(error);
        });
        test('delete empty folder', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const folder = (0, resources_1.joinPath)(parent.resource, 'folder');
            await service.createFolder(folder);
            await service.del(folder);
            assert.deepStrictEqual(await service.exists(folder), false);
        });
        test('delete empty folder with reccursive', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const folder = (0, resources_1.joinPath)(parent.resource, 'folder');
            await service.createFolder(folder);
            await service.del(folder, { recursive: true });
            assert.deepStrictEqual(await service.exists(folder), false);
        });
        test('deleteFolder with folders and files (recursive)', async () => {
            const parent = await service.resolve(userdataURIFromPaths([]));
            const targetFolder = (0, resources_1.joinPath)(parent.resource, 'targetFolder');
            const file1 = (0, resources_1.joinPath)(targetFolder, 'folder1', 'file1');
            await service.createFile(file1);
            const file2 = (0, resources_1.joinPath)(targetFolder, 'folder2', 'file1');
            await service.createFile(file2);
            const emptyFolder = (0, resources_1.joinPath)(targetFolder, 'folder3');
            await service.createFolder(emptyFolder);
            await service.del(targetFolder, { recursive: true });
            assert.deepStrictEqual(await service.exists(targetFolder), false);
            assert.deepStrictEqual(await service.exists((0, resources_1.joinPath)(targetFolder, 'folder1')), false);
            assert.deepStrictEqual(await service.exists((0, resources_1.joinPath)(targetFolder, 'folder2')), false);
            assert.deepStrictEqual(await service.exists(file1), false);
            assert.deepStrictEqual(await service.exists(file2), false);
            assert.deepStrictEqual(await service.exists(emptyFolder), false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhlZERCRmlsZVNlcnZpY2UuaW50ZWdyYXRpb25UZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZmlsZXMvdGVzdC9icm93c2VyL2luZGV4ZWREQkZpbGVTZXJ2aWNlLmludGVncmF0aW9uVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWVoRyxJQUFBLHNCQUFVLEVBQUMsNkJBQTZCLEVBQUU7UUFFekMsSUFBSSxPQUFvQixDQUFDO1FBQ3pCLElBQUksb0JBQWlELENBQUM7UUFDdEQsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBRXBCLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxLQUF3QixFQUFFLEVBQUUsQ0FBQyxJQUFBLG9CQUFRLEVBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBRTNJLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLE1BQU0sWUFBWSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQy9CLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDaEIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDO2dCQUNyQyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztnQkFDekMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQztnQkFDL0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDVixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdkMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVks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