/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "os", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/node/pfs", "vs/base/test/node/testUtils", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/log/common/log"], function (require, exports, assert, fs_1, os_1, async_1, buffer_1, lifecycle_1, network_1, path_1, platform_1, resources_1, uri_1, pfs_1, testUtils_1, files_1, fileService_1, diskFileSystemProvider_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$z$b = void 0;
    function getByName(root, name) {
        if (root.children === undefined) {
            return undefined;
        }
        return root.children.find(child => child.name === name);
    }
    function toLineByLineReadable(content) {
        let chunks = content.split('\n');
        chunks = chunks.map((chunk, index) => {
            if (index === 0) {
                return chunk;
            }
            return '\n' + chunk;
        });
        return {
            read() {
                const chunk = chunks.shift();
                if (typeof chunk === 'string') {
                    return buffer_1.$Fd.fromString(chunk);
                }
                return null;
            }
        };
    }
    class $z$b extends diskFileSystemProvider_1.$3p {
        constructor() {
            super(...arguments);
            this.totalBytesRead = 0;
            this.gb = false;
            this.hb = false;
            this.ib = false;
        }
        get capabilities() {
            if (!this.jb) {
                this.jb =
                    2 /* FileSystemProviderCapabilities.FileReadWrite */ |
                        4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ |
                        16 /* FileSystemProviderCapabilities.FileReadStream */ |
                        4096 /* FileSystemProviderCapabilities.Trash */ |
                        8 /* FileSystemProviderCapabilities.FileFolderCopy */ |
                        8192 /* FileSystemProviderCapabilities.FileWriteUnlock */ |
                        16384 /* FileSystemProviderCapabilities.FileAtomicRead */ |
                        32768 /* FileSystemProviderCapabilities.FileAtomicWrite */ |
                        65536 /* FileSystemProviderCapabilities.FileAtomicDelete */ |
                        131072 /* FileSystemProviderCapabilities.FileClone */;
                if (platform_1.$k) {
                    this.jb |= 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
                }
            }
            return this.jb;
        }
        set capabilities(capabilities) {
            this.jb = capabilities;
        }
        setInvalidStatSize(enabled) {
            this.gb = enabled;
        }
        setSmallStatSize(enabled) {
            this.hb = enabled;
        }
        setReadonly(readonly) {
            this.ib = readonly;
        }
        async stat(resource) {
            const res = await super.stat(resource);
            if (this.gb) {
                res.size = String(res.size); // for https://github.com/microsoft/vscode/issues/72909
            }
            else if (this.hb) {
                res.size = 1;
            }
            else if (this.ib) {
                res.permissions = files_1.FilePermission.Readonly;
            }
            return res;
        }
        async read(fd, pos, data, offset, length) {
            const bytesRead = await super.read(fd, pos, data, offset, length);
            this.totalBytesRead += bytesRead;
            return bytesRead;
        }
        async readFile(resource, options) {
            const res = await super.readFile(resource, options);
            this.totalBytesRead += res.byteLength;
            return res;
        }
    }
    exports.$z$b = $z$b;
    diskFileSystemProvider_1.$3p.configureFlushOnWrite(false); // speed up all unit tests by disabling flush on write
    (0, testUtils_1.flakySuite)('Disk File Service', function () {
        const testSchema = 'test';
        let service;
        let fileProvider;
        let testProvider;
        let testDir;
        const disposables = new lifecycle_1.$jc();
        setup(async () => {
            const logService = new log_1.$fj();
            service = new fileService_1.$Dp(logService);
            disposables.add(service);
            fileProvider = new $z$b(logService);
            disposables.add(service.registerProvider(network_1.Schemas.file, fileProvider));
            disposables.add(fileProvider);
            testProvider = new $z$b(logService);
            disposables.add(service.registerProvider(testSchema, testProvider));
            disposables.add(testProvider);
            testDir = (0, testUtils_1.$oT)((0, os_1.tmpdir)(), 'vsctests', 'diskfileservice');
            const sourceDir = network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/service').fsPath;
            await pfs_1.Promises.copy(sourceDir, testDir, { preserveSymlinks: false });
        });
        teardown(() => {
            disposables.clear();
            return pfs_1.Promises.rm(testDir);
        });
        test('createFolder', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const parent = await service.resolve(uri_1.URI.file(testDir));
            const newFolderResource = uri_1.URI.file((0, path_1.$9d)(parent.resource.fsPath, 'newFolder'));
            const newFolder = await service.createFolder(newFolderResource);
            assert.strictEqual(newFolder.name, 'newFolder');
            assert.strictEqual((0, fs_1.existsSync)(newFolder.resource.fsPath), true);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, newFolderResource.fsPath);
            assert.strictEqual(event.operation, 0 /* FileOperation.CREATE */);
            assert.strictEqual(event.target.resource.fsPath, newFolderResource.fsPath);
            assert.strictEqual(event.target.isDirectory, true);
        });
        test('createFolder: creating multiple folders at once', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const multiFolderPaths = ['a', 'couple', 'of', 'folders'];
            const parent = await service.resolve(uri_1.URI.file(testDir));
            const newFolderResource = uri_1.URI.file((0, path_1.$9d)(parent.resource.fsPath, ...multiFolderPaths));
            const newFolder = await service.createFolder(newFolderResource);
            const lastFolderName = multiFolderPaths[multiFolderPaths.length - 1];
            assert.strictEqual(newFolder.name, lastFolderName);
            assert.strictEqual((0, fs_1.existsSync)(newFolder.resource.fsPath), true);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, newFolderResource.fsPath);
            assert.strictEqual(event.operation, 0 /* FileOperation.CREATE */);
            assert.strictEqual(event.target.resource.fsPath, newFolderResource.fsPath);
            assert.strictEqual(event.target.isDirectory, true);
        });
        test('exists', async () => {
            let exists = await service.exists(uri_1.URI.file(testDir));
            assert.strictEqual(exists, true);
            exists = await service.exists(uri_1.URI.file(testDir + 'something'));
            assert.strictEqual(exists, false);
        });
        test('resolve - file', async () => {
            const resource = network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/resolver/index.html');
            const resolved = await service.resolve(resource);
            assert.strictEqual(resolved.name, 'index.html');
            assert.strictEqual(resolved.isFile, true);
            assert.strictEqual(resolved.isDirectory, false);
            assert.strictEqual(resolved.readonly, false);
            assert.strictEqual(resolved.isSymbolicLink, false);
            assert.strictEqual(resolved.resource.toString(), resource.toString());
            assert.strictEqual(resolved.children, undefined);
            assert.ok(resolved.mtime > 0);
            assert.ok(resolved.ctime > 0);
            assert.ok(resolved.size > 0);
        });
        test('resolve - directory', async () => {
            const testsElements = ['examples', 'other', 'index.html', 'site.css'];
            const resource = network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/resolver');
            const result = await service.resolve(resource);
            assert.ok(result);
            assert.strictEqual(result.resource.toString(), resource.toString());
            assert.strictEqual(result.name, 'resolver');
            assert.ok(result.children);
            assert.ok(result.children.length > 0);
            assert.ok(result.isDirectory);
            assert.strictEqual(result.readonly, false);
            assert.ok(result.mtime > 0);
            assert.ok(result.ctime > 0);
            assert.strictEqual(result.children.length, testsElements.length);
            assert.ok(result.children.every(entry => {
                return testsElements.some(name => {
                    return (0, path_1.$ae)(entry.resource.fsPath) === name;
                });
            }));
            result.children.forEach(value => {
                assert.ok((0, path_1.$ae)(value.resource.fsPath));
                if (['examples', 'other'].indexOf((0, path_1.$ae)(value.resource.fsPath)) >= 0) {
                    assert.ok(value.isDirectory);
                    assert.strictEqual(value.mtime, undefined);
                    assert.strictEqual(value.ctime, undefined);
                }
                else if ((0, path_1.$ae)(value.resource.fsPath) === 'index.html') {
                    assert.ok(!value.isDirectory);
                    assert.ok(!value.children);
                    assert.strictEqual(value.mtime, undefined);
                    assert.strictEqual(value.ctime, undefined);
                }
                else if ((0, path_1.$ae)(value.resource.fsPath) === 'site.css') {
                    assert.ok(!value.isDirectory);
                    assert.ok(!value.children);
                    assert.strictEqual(value.mtime, undefined);
                    assert.strictEqual(value.ctime, undefined);
                }
                else {
                    assert.ok(!'Unexpected value ' + (0, path_1.$ae)(value.resource.fsPath));
                }
            });
        });
        test('resolve - directory - with metadata', async () => {
            const testsElements = ['examples', 'other', 'index.html', 'site.css'];
            const result = await service.resolve(network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/resolver'), { resolveMetadata: true });
            assert.ok(result);
            assert.strictEqual(result.name, 'resolver');
            assert.ok(result.children);
            assert.ok(result.children.length > 0);
            assert.ok(result.isDirectory);
            assert.ok(result.mtime > 0);
            assert.ok(result.ctime > 0);
            assert.strictEqual(result.children.length, testsElements.length);
            assert.ok(result.children.every(entry => {
                return testsElements.some(name => {
                    return (0, path_1.$ae)(entry.resource.fsPath) === name;
                });
            }));
            assert.ok(result.children.every(entry => entry.etag.length > 0));
            result.children.forEach(value => {
                assert.ok((0, path_1.$ae)(value.resource.fsPath));
                if (['examples', 'other'].indexOf((0, path_1.$ae)(value.resource.fsPath)) >= 0) {
                    assert.ok(value.isDirectory);
                    assert.ok(value.mtime > 0);
                    assert.ok(value.ctime > 0);
                }
                else if ((0, path_1.$ae)(value.resource.fsPath) === 'index.html') {
                    assert.ok(!value.isDirectory);
                    assert.ok(!value.children);
                    assert.ok(value.mtime > 0);
                    assert.ok(value.ctime > 0);
                }
                else if ((0, path_1.$ae)(value.resource.fsPath) === 'site.css') {
                    assert.ok(!value.isDirectory);
                    assert.ok(!value.children);
                    assert.ok(value.mtime > 0);
                    assert.ok(value.ctime > 0);
                }
                else {
                    assert.ok(!'Unexpected value ' + (0, path_1.$ae)(value.resource.fsPath));
                }
            });
        });
        test('resolve - directory with resolveTo', async () => {
            const resolved = await service.resolve(uri_1.URI.file(testDir), { resolveTo: [uri_1.URI.file((0, path_1.$9d)(testDir, 'deep'))] });
            assert.strictEqual(resolved.children.length, 8);
            const deep = (getByName(resolved, 'deep'));
            assert.strictEqual(deep.children.length, 4);
        });
        test('resolve - directory - resolveTo single directory', async () => {
            const resolverFixturesPath = network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/resolver').fsPath;
            const result = await service.resolve(uri_1.URI.file(resolverFixturesPath), { resolveTo: [uri_1.URI.file((0, path_1.$9d)(resolverFixturesPath, 'other/deep'))] });
            assert.ok(result);
            assert.ok(result.children);
            assert.ok(result.children.length > 0);
            assert.ok(result.isDirectory);
            const children = result.children;
            assert.strictEqual(children.length, 4);
            const other = getByName(result, 'other');
            assert.ok(other);
            assert.ok(other.children.length > 0);
            const deep = getByName(other, 'deep');
            assert.ok(deep);
            assert.ok(deep.children.length > 0);
            assert.strictEqual(deep.children.length, 4);
        });
        test('resolve directory - resolveTo multiple directories', () => {
            return testResolveDirectoryWithTarget(false);
        });
        test('resolve directory - resolveTo with a URI that has query parameter (https://github.com/microsoft/vscode/issues/128151)', () => {
            return testResolveDirectoryWithTarget(true);
        });
        async function testResolveDirectoryWithTarget(withQueryParam) {
            const resolverFixturesPath = network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/resolver').fsPath;
            const result = await service.resolve(uri_1.URI.file(resolverFixturesPath).with({ query: withQueryParam ? 'test' : undefined }), {
                resolveTo: [
                    uri_1.URI.file((0, path_1.$9d)(resolverFixturesPath, 'other/deep')).with({ query: withQueryParam ? 'test' : undefined }),
                    uri_1.URI.file((0, path_1.$9d)(resolverFixturesPath, 'examples')).with({ query: withQueryParam ? 'test' : undefined })
                ]
            });
            assert.ok(result);
            assert.ok(result.children);
            assert.ok(result.children.length > 0);
            assert.ok(result.isDirectory);
            const children = result.children;
            assert.strictEqual(children.length, 4);
            const other = getByName(result, 'other');
            assert.ok(other);
            assert.ok(other.children.length > 0);
            const deep = getByName(other, 'deep');
            assert.ok(deep);
            assert.ok(deep.children.length > 0);
            assert.strictEqual(deep.children.length, 4);
            const examples = getByName(result, 'examples');
            assert.ok(examples);
            assert.ok(examples.children.length > 0);
            assert.strictEqual(examples.children.length, 4);
        }
        test('resolve directory - resolveSingleChildFolders', async () => {
            const resolverFixturesPath = network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/resolver/other').fsPath;
            const result = await service.resolve(uri_1.URI.file(resolverFixturesPath), { resolveSingleChildDescendants: true });
            assert.ok(result);
            assert.ok(result.children);
            assert.ok(result.children.length > 0);
            assert.ok(result.isDirectory);
            const children = result.children;
            assert.strictEqual(children.length, 1);
            const deep = getByName(result, 'deep');
            assert.ok(deep);
            assert.ok(deep.children.length > 0);
            assert.strictEqual(deep.children.length, 4);
        });
        test('resolves', async () => {
            const res = await service.resolveAll([
                { resource: uri_1.URI.file(testDir), options: { resolveTo: [uri_1.URI.file((0, path_1.$9d)(testDir, 'deep'))] } },
                { resource: uri_1.URI.file((0, path_1.$9d)(testDir, 'deep')) }
            ]);
            const r1 = (res[0].stat);
            assert.strictEqual(r1.children.length, 8);
            const deep = (getByName(r1, 'deep'));
            assert.strictEqual(deep.children.length, 4);
            const r2 = (res[1].stat);
            assert.strictEqual(r2.children.length, 4);
            assert.strictEqual(r2.name, 'deep');
        });
        test('resolve - folder symbolic link', async () => {
            const link = uri_1.URI.file((0, path_1.$9d)(testDir, 'deep-link'));
            await pfs_1.Promises.symlink((0, path_1.$9d)(testDir, 'deep'), link.fsPath, 'junction');
            const resolved = await service.resolve(link);
            assert.strictEqual(resolved.children.length, 4);
            assert.strictEqual(resolved.isDirectory, true);
            assert.strictEqual(resolved.isSymbolicLink, true);
        });
        (platform_1.$i ? test.skip /* windows: cannot create file symbolic link without elevated context */ : test)('resolve - file symbolic link', async () => {
            const link = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt-linked'));
            await pfs_1.Promises.symlink((0, path_1.$9d)(testDir, 'lorem.txt'), link.fsPath);
            const resolved = await service.resolve(link);
            assert.strictEqual(resolved.isDirectory, false);
            assert.strictEqual(resolved.isSymbolicLink, true);
        });
        test('resolve - symbolic link pointing to nonexistent file does not break', async () => {
            await pfs_1.Promises.symlink((0, path_1.$9d)(testDir, 'foo'), (0, path_1.$9d)(testDir, 'bar'), 'junction');
            const resolved = await service.resolve(uri_1.URI.file(testDir));
            assert.strictEqual(resolved.isDirectory, true);
            assert.strictEqual(resolved.children.length, 9);
            const resolvedLink = resolved.children?.find(child => child.name === 'bar' && child.isSymbolicLink);
            assert.ok(resolvedLink);
            assert.ok(!resolvedLink?.isDirectory);
            assert.ok(!resolvedLink?.isFile);
        });
        test('stat - file', async () => {
            const resource = network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/resolver/index.html');
            const resolved = await service.stat(resource);
            assert.strictEqual(resolved.name, 'index.html');
            assert.strictEqual(resolved.isFile, true);
            assert.strictEqual(resolved.isDirectory, false);
            assert.strictEqual(resolved.readonly, false);
            assert.strictEqual(resolved.isSymbolicLink, false);
            assert.strictEqual(resolved.resource.toString(), resource.toString());
            assert.ok(resolved.mtime > 0);
            assert.ok(resolved.ctime > 0);
            assert.ok(resolved.size > 0);
        });
        test('stat - directory', async () => {
            const resource = network_1.$2f.asFileUri('vs/platform/files/test/node/fixtures/resolver');
            const result = await service.stat(resource);
            assert.ok(result);
            assert.strictEqual(result.resource.toString(), resource.toString());
            assert.strictEqual(result.name, 'resolver');
            assert.ok(result.isDirectory);
            assert.strictEqual(result.readonly, false);
            assert.ok(result.mtime > 0);
            assert.ok(result.ctime > 0);
        });
        test('deleteFile (non recursive)', async () => {
            return testDeleteFile(false, false);
        });
        test('deleteFile (recursive)', async () => {
            return testDeleteFile(false, true);
        });
        (platform_1.$k /* trash is unreliable on Linux */ ? test.skip : test)('deleteFile (useTrash)', async () => {
            return testDeleteFile(true, false);
        });
        async function testDeleteFile(useTrash, recursive) {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'deep', 'conway.js'));
            const source = await service.resolve(resource);
            assert.strictEqual(await service.canDelete(source.resource, { useTrash, recursive }), true);
            await service.del(source.resource, { useTrash, recursive });
            assert.strictEqual((0, fs_1.existsSync)(source.resource.fsPath), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, resource.fsPath);
            assert.strictEqual(event.operation, 1 /* FileOperation.DELETE */);
            let error = undefined;
            try {
                await service.del(source.resource, { useTrash, recursive });
            }
            catch (e) {
                error = e;
            }
            assert.ok(error);
            assert.strictEqual(error.fileOperationResult, 1 /* FileOperationResult.FILE_NOT_FOUND */);
        }
        (platform_1.$i ? test.skip /* windows: cannot create file symbolic link without elevated context */ : test)('deleteFile - symbolic link (exists)', async () => {
            const target = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const link = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt-linked'));
            await pfs_1.Promises.symlink(target.fsPath, link.fsPath);
            const source = await service.resolve(link);
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            assert.strictEqual(await service.canDelete(source.resource), true);
            await service.del(source.resource);
            assert.strictEqual((0, fs_1.existsSync)(source.resource.fsPath), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, link.fsPath);
            assert.strictEqual(event.operation, 1 /* FileOperation.DELETE */);
            assert.strictEqual((0, fs_1.existsSync)(target.fsPath), true); // target the link pointed to is never deleted
        });
        (platform_1.$i ? test.skip /* windows: cannot create file symbolic link without elevated context */ : test)('deleteFile - symbolic link (pointing to nonexistent file)', async () => {
            const target = uri_1.URI.file((0, path_1.$9d)(testDir, 'foo'));
            const link = uri_1.URI.file((0, path_1.$9d)(testDir, 'bar'));
            await pfs_1.Promises.symlink(target.fsPath, link.fsPath);
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            assert.strictEqual(await service.canDelete(link), true);
            await service.del(link);
            assert.strictEqual((0, fs_1.existsSync)(link.fsPath), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, link.fsPath);
            assert.strictEqual(event.operation, 1 /* FileOperation.DELETE */);
        });
        test('deleteFolder (recursive)', async () => {
            return testDeleteFolderRecursive(false, false);
        });
        test('deleteFolder (recursive, atomic)', async () => {
            return testDeleteFolderRecursive(false, { postfix: '.vsctmp' });
        });
        (platform_1.$k /* trash is unreliable on Linux */ ? test.skip : test)('deleteFolder (recursive, useTrash)', async () => {
            return testDeleteFolderRecursive(true, false);
        });
        async function testDeleteFolderRecursive(useTrash, atomic) {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'deep'));
            const source = await service.resolve(resource);
            assert.strictEqual(await service.canDelete(source.resource, { recursive: true, useTrash, atomic }), true);
            await service.del(source.resource, { recursive: true, useTrash, atomic });
            assert.strictEqual((0, fs_1.existsSync)(source.resource.fsPath), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, resource.fsPath);
            assert.strictEqual(event.operation, 1 /* FileOperation.DELETE */);
        }
        test('deleteFolder (non recursive)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'deep'));
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
        test('deleteFolder empty folder (recursive)', () => {
            return testDeleteEmptyFolder(true);
        });
        test('deleteFolder empty folder (non recursive)', () => {
            return testDeleteEmptyFolder(false);
        });
        async function testDeleteEmptyFolder(recursive) {
            const { resource } = await service.createFolder(uri_1.URI.file((0, path_1.$9d)(testDir, 'deep', 'empty')));
            await service.del(resource, { recursive });
            assert.strictEqual(await service.exists(resource), false);
        }
        test('move', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            const sourceContents = (0, fs_1.readFileSync)(source.fsPath);
            const target = uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.fsPath), 'other.html'));
            assert.strictEqual(await service.canMove(source, target), true);
            const renamed = await service.move(source, target);
            assert.strictEqual((0, fs_1.existsSync)(renamed.resource.fsPath), true);
            assert.strictEqual((0, fs_1.existsSync)(source.fsPath), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.fsPath);
            assert.strictEqual(event.operation, 2 /* FileOperation.MOVE */);
            assert.strictEqual(event.target.resource.fsPath, renamed.resource.fsPath);
            const targetContents = (0, fs_1.readFileSync)(target.fsPath);
            assert.strictEqual(sourceContents.byteLength, targetContents.byteLength);
            assert.strictEqual(sourceContents.toString(), targetContents.toString());
        });
        test('move - across providers (buffered => buffered)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            setCapabilities(testProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testMoveAcrossProviders();
        });
        test('move - across providers (unbuffered => unbuffered)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            setCapabilities(testProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testMoveAcrossProviders();
        });
        test('move - across providers (buffered => unbuffered)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            setCapabilities(testProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testMoveAcrossProviders();
        });
        test('move - across providers (unbuffered => buffered)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            setCapabilities(testProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testMoveAcrossProviders();
        });
        test('move - across providers - large (buffered => buffered)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            setCapabilities(testProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testMoveAcrossProviders('lorem.txt');
        });
        test('move - across providers - large (unbuffered => unbuffered)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            setCapabilities(testProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testMoveAcrossProviders('lorem.txt');
        });
        test('move - across providers - large (buffered => unbuffered)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            setCapabilities(testProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testMoveAcrossProviders('lorem.txt');
        });
        test('move - across providers - large (unbuffered => buffered)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            setCapabilities(testProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testMoveAcrossProviders('lorem.txt');
        });
        async function testMoveAcrossProviders(sourceFile = 'index.html') {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = uri_1.URI.file((0, path_1.$9d)(testDir, sourceFile));
            const sourceContents = (0, fs_1.readFileSync)(source.fsPath);
            const target = uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.fsPath), 'other.html')).with({ scheme: testSchema });
            assert.strictEqual(await service.canMove(source, target), true);
            const renamed = await service.move(source, target);
            assert.strictEqual((0, fs_1.existsSync)(renamed.resource.fsPath), true);
            assert.strictEqual((0, fs_1.existsSync)(source.fsPath), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.fsPath);
            assert.strictEqual(event.operation, 3 /* FileOperation.COPY */);
            assert.strictEqual(event.target.resource.fsPath, renamed.resource.fsPath);
            const targetContents = (0, fs_1.readFileSync)(target.fsPath);
            assert.strictEqual(sourceContents.byteLength, targetContents.byteLength);
            assert.strictEqual(sourceContents.toString(), targetContents.toString());
        }
        test('move - multi folder', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const multiFolderPaths = ['a', 'couple', 'of', 'folders'];
            const renameToPath = (0, path_1.$9d)(...multiFolderPaths, 'other.html');
            const source = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            assert.strictEqual(await service.canMove(source, uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.fsPath), renameToPath))), true);
            const renamed = await service.move(source, uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.fsPath), renameToPath)));
            assert.strictEqual((0, fs_1.existsSync)(renamed.resource.fsPath), true);
            assert.strictEqual((0, fs_1.existsSync)(source.fsPath), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.fsPath);
            assert.strictEqual(event.operation, 2 /* FileOperation.MOVE */);
            assert.strictEqual(event.target.resource.fsPath, renamed.resource.fsPath);
        });
        test('move - directory', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = uri_1.URI.file((0, path_1.$9d)(testDir, 'deep'));
            assert.strictEqual(await service.canMove(source, uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.fsPath), 'deeper'))), true);
            const renamed = await service.move(source, uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.fsPath), 'deeper')));
            assert.strictEqual((0, fs_1.existsSync)(renamed.resource.fsPath), true);
            assert.strictEqual((0, fs_1.existsSync)(source.fsPath), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.fsPath);
            assert.strictEqual(event.operation, 2 /* FileOperation.MOVE */);
            assert.strictEqual(event.target.resource.fsPath, renamed.resource.fsPath);
        });
        test('move - directory - across providers (buffered => buffered)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            setCapabilities(testProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testMoveFolderAcrossProviders();
        });
        test('move - directory - across providers (unbuffered => unbuffered)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            setCapabilities(testProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testMoveFolderAcrossProviders();
        });
        test('move - directory - across providers (buffered => unbuffered)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            setCapabilities(testProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testMoveFolderAcrossProviders();
        });
        test('move - directory - across providers (unbuffered => buffered)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            setCapabilities(testProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testMoveFolderAcrossProviders();
        });
        async function testMoveFolderAcrossProviders() {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = uri_1.URI.file((0, path_1.$9d)(testDir, 'deep'));
            const sourceChildren = (0, fs_1.readdirSync)(source.fsPath);
            const target = uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.fsPath), 'deeper')).with({ scheme: testSchema });
            assert.strictEqual(await service.canMove(source, target), true);
            const renamed = await service.move(source, target);
            assert.strictEqual((0, fs_1.existsSync)(renamed.resource.fsPath), true);
            assert.strictEqual((0, fs_1.existsSync)(source.fsPath), false);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.fsPath);
            assert.strictEqual(event.operation, 3 /* FileOperation.COPY */);
            assert.strictEqual(event.target.resource.fsPath, renamed.resource.fsPath);
            const targetChildren = (0, fs_1.readdirSync)(target.fsPath);
            assert.strictEqual(sourceChildren.length, targetChildren.length);
            for (let i = 0; i < sourceChildren.length; i++) {
                assert.strictEqual(sourceChildren[i], targetChildren[i]);
            }
        }
        test('move - MIX CASE', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            assert.ok(source.size > 0);
            const renamedResource = uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.resource.fsPath), 'INDEX.html'));
            assert.strictEqual(await service.canMove(source.resource, renamedResource), true);
            let renamed = await service.move(source.resource, renamedResource);
            assert.strictEqual((0, fs_1.existsSync)(renamedResource.fsPath), true);
            assert.strictEqual((0, path_1.$ae)(renamedResource.fsPath), 'INDEX.html');
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.resource.fsPath);
            assert.strictEqual(event.operation, 2 /* FileOperation.MOVE */);
            assert.strictEqual(event.target.resource.fsPath, renamedResource.fsPath);
            renamed = await service.resolve(renamedResource, { resolveMetadata: true });
            assert.strictEqual(source.size, renamed.size);
        });
        test('move - same file', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            assert.ok(source.size > 0);
            assert.strictEqual(await service.canMove(source.resource, uri_1.URI.file(source.resource.fsPath)), true);
            let renamed = await service.move(source.resource, uri_1.URI.file(source.resource.fsPath));
            assert.strictEqual((0, fs_1.existsSync)(renamed.resource.fsPath), true);
            assert.strictEqual((0, path_1.$ae)(renamed.resource.fsPath), 'index.html');
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.resource.fsPath);
            assert.strictEqual(event.operation, 2 /* FileOperation.MOVE */);
            assert.strictEqual(event.target.resource.fsPath, renamed.resource.fsPath);
            renamed = await service.resolve(renamed.resource, { resolveMetadata: true });
            assert.strictEqual(source.size, renamed.size);
        });
        test('move - same file #2', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            assert.ok(source.size > 0);
            const targetParent = uri_1.URI.file(testDir);
            const target = targetParent.with({ path: path_1.$6d.join(targetParent.path, path_1.$6d.basename(source.resource.path)) });
            assert.strictEqual(await service.canMove(source.resource, target), true);
            let renamed = await service.move(source.resource, target);
            assert.strictEqual((0, fs_1.existsSync)(renamed.resource.fsPath), true);
            assert.strictEqual((0, path_1.$ae)(renamed.resource.fsPath), 'index.html');
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.resource.fsPath);
            assert.strictEqual(event.operation, 2 /* FileOperation.MOVE */);
            assert.strictEqual(event.target.resource.fsPath, renamed.resource.fsPath);
            renamed = await service.resolve(renamed.resource, { resolveMetadata: true });
            assert.strictEqual(source.size, renamed.size);
        });
        test('move - source parent of target', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            let source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            const originalSize = source.size;
            assert.ok(originalSize > 0);
            assert.ok((await service.canMove(uri_1.URI.file(testDir), uri_1.URI.file((0, path_1.$9d)(testDir, 'binary.txt'))) instanceof Error));
            let error;
            try {
                await service.move(uri_1.URI.file(testDir), uri_1.URI.file((0, path_1.$9d)(testDir, 'binary.txt')));
            }
            catch (e) {
                error = e;
            }
            assert.ok(error);
            assert.ok(!event);
            source = await service.resolve(source.resource, { resolveMetadata: true });
            assert.strictEqual(originalSize, source.size);
        });
        test('move - FILE_MOVE_CONFLICT', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            let source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            const originalSize = source.size;
            assert.ok(originalSize > 0);
            assert.ok((await service.canMove(source.resource, uri_1.URI.file((0, path_1.$9d)(testDir, 'binary.txt'))) instanceof Error));
            let error;
            try {
                await service.move(source.resource, uri_1.URI.file((0, path_1.$9d)(testDir, 'binary.txt')));
            }
            catch (e) {
                error = e;
            }
            assert.strictEqual(error.fileOperationResult, 4 /* FileOperationResult.FILE_MOVE_CONFLICT */);
            assert.ok(!event);
            source = await service.resolve(source.resource, { resolveMetadata: true });
            assert.strictEqual(originalSize, source.size);
        });
        test('move - overwrite folder with file', async () => {
            let createEvent;
            let moveEvent;
            let deleteEvent;
            disposables.add(service.onDidRunOperation(e => {
                if (e.operation === 0 /* FileOperation.CREATE */) {
                    createEvent = e;
                }
                else if (e.operation === 1 /* FileOperation.DELETE */) {
                    deleteEvent = e;
                }
                else if (e.operation === 2 /* FileOperation.MOVE */) {
                    moveEvent = e;
                }
            }));
            const parent = await service.resolve(uri_1.URI.file(testDir));
            const folderResource = uri_1.URI.file((0, path_1.$9d)(parent.resource.fsPath, 'conway.js'));
            const f = await service.createFolder(folderResource);
            const source = uri_1.URI.file((0, path_1.$9d)(testDir, 'deep', 'conway.js'));
            assert.strictEqual(await service.canMove(source, f.resource, true), true);
            const moved = await service.move(source, f.resource, true);
            assert.strictEqual((0, fs_1.existsSync)(moved.resource.fsPath), true);
            assert.ok((0, fs_1.statSync)(moved.resource.fsPath).isFile);
            assert.ok(createEvent);
            assert.ok(deleteEvent);
            assert.ok(moveEvent);
            assert.strictEqual(moveEvent.resource.fsPath, source.fsPath);
            assert.strictEqual(moveEvent.target.resource.fsPath, moved.resource.fsPath);
            assert.strictEqual(deleteEvent.resource.fsPath, folderResource.fsPath);
        });
        test('copy', async () => {
            await doTestCopy();
        });
        test('copy - unbuffered (FileSystemProviderCapabilities.FileReadWrite)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            await doTestCopy();
        });
        test('copy - unbuffered large (FileSystemProviderCapabilities.FileReadWrite)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            await doTestCopy('lorem.txt');
        });
        test('copy - buffered (FileSystemProviderCapabilities.FileOpenReadWriteClose)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            await doTestCopy();
        });
        test('copy - buffered large (FileSystemProviderCapabilities.FileOpenReadWriteClose)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            await doTestCopy('lorem.txt');
        });
        function setCapabilities(provider, capabilities) {
            provider.capabilities = capabilities;
            if (platform_1.$k) {
                provider.capabilities |= 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
            }
        }
        async function doTestCopy(sourceName = 'index.html') {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, sourceName)));
            const target = uri_1.URI.file((0, path_1.$9d)(testDir, 'other.html'));
            assert.strictEqual(await service.canCopy(source.resource, target), true);
            const copied = await service.copy(source.resource, target);
            assert.strictEqual((0, fs_1.existsSync)(copied.resource.fsPath), true);
            assert.strictEqual((0, fs_1.existsSync)(source.resource.fsPath), true);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.resource.fsPath);
            assert.strictEqual(event.operation, 3 /* FileOperation.COPY */);
            assert.strictEqual(event.target.resource.fsPath, copied.resource.fsPath);
            const sourceContents = (0, fs_1.readFileSync)(source.resource.fsPath);
            const targetContents = (0, fs_1.readFileSync)(target.fsPath);
            assert.strictEqual(sourceContents.byteLength, targetContents.byteLength);
            assert.strictEqual(sourceContents.toString(), targetContents.toString());
        }
        test('copy - overwrite folder with file', async () => {
            let createEvent;
            let copyEvent;
            let deleteEvent;
            disposables.add(service.onDidRunOperation(e => {
                if (e.operation === 0 /* FileOperation.CREATE */) {
                    createEvent = e;
                }
                else if (e.operation === 1 /* FileOperation.DELETE */) {
                    deleteEvent = e;
                }
                else if (e.operation === 3 /* FileOperation.COPY */) {
                    copyEvent = e;
                }
            }));
            const parent = await service.resolve(uri_1.URI.file(testDir));
            const folderResource = uri_1.URI.file((0, path_1.$9d)(parent.resource.fsPath, 'conway.js'));
            const f = await service.createFolder(folderResource);
            const source = uri_1.URI.file((0, path_1.$9d)(testDir, 'deep', 'conway.js'));
            assert.strictEqual(await service.canCopy(source, f.resource, true), true);
            const copied = await service.copy(source, f.resource, true);
            assert.strictEqual((0, fs_1.existsSync)(copied.resource.fsPath), true);
            assert.ok((0, fs_1.statSync)(copied.resource.fsPath).isFile);
            assert.ok(createEvent);
            assert.ok(deleteEvent);
            assert.ok(copyEvent);
            assert.strictEqual(copyEvent.resource.fsPath, source.fsPath);
            assert.strictEqual(copyEvent.target.resource.fsPath, copied.resource.fsPath);
            assert.strictEqual(deleteEvent.resource.fsPath, folderResource.fsPath);
        });
        test('copy - MIX CASE same target - no overwrite', async () => {
            let source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            const originalSize = source.size;
            assert.ok(originalSize > 0);
            const target = uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.resource.fsPath), 'INDEX.html'));
            const canCopy = await service.canCopy(source.resource, target);
            let error;
            let copied;
            try {
                copied = await service.copy(source.resource, target);
            }
            catch (e) {
                error = e;
            }
            if (platform_1.$k) {
                assert.ok(!error);
                assert.strictEqual(canCopy, true);
                assert.strictEqual((0, fs_1.existsSync)(copied.resource.fsPath), true);
                assert.ok((0, fs_1.readdirSync)(testDir).some(f => f === 'INDEX.html'));
                assert.strictEqual(source.size, copied.size);
            }
            else {
                assert.ok(error);
                assert.ok(canCopy instanceof Error);
                source = await service.resolve(source.resource, { resolveMetadata: true });
                assert.strictEqual(originalSize, source.size);
            }
        });
        test('copy - MIX CASE same target - overwrite', async () => {
            let source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            const originalSize = source.size;
            assert.ok(originalSize > 0);
            const target = uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source.resource.fsPath), 'INDEX.html'));
            const canCopy = await service.canCopy(source.resource, target, true);
            let error;
            let copied;
            try {
                copied = await service.copy(source.resource, target, true);
            }
            catch (e) {
                error = e;
            }
            if (platform_1.$k) {
                assert.ok(!error);
                assert.strictEqual(canCopy, true);
                assert.strictEqual((0, fs_1.existsSync)(copied.resource.fsPath), true);
                assert.ok((0, fs_1.readdirSync)(testDir).some(f => f === 'INDEX.html'));
                assert.strictEqual(source.size, copied.size);
            }
            else {
                assert.ok(error);
                assert.ok(canCopy instanceof Error);
                source = await service.resolve(source.resource, { resolveMetadata: true });
                assert.strictEqual(originalSize, source.size);
            }
        });
        test('copy - MIX CASE different target - overwrite', async () => {
            const source1 = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            assert.ok(source1.size > 0);
            const renamed = await service.move(source1.resource, uri_1.URI.file((0, path_1.$9d)((0, path_1.$_d)(source1.resource.fsPath), 'CONWAY.js')));
            assert.strictEqual((0, fs_1.existsSync)(renamed.resource.fsPath), true);
            assert.ok((0, fs_1.readdirSync)(testDir).some(f => f === 'CONWAY.js'));
            assert.strictEqual(source1.size, renamed.size);
            const source2 = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'deep', 'conway.js')), { resolveMetadata: true });
            const target = uri_1.URI.file((0, path_1.$9d)(testDir, (0, path_1.$ae)(source2.resource.path)));
            assert.strictEqual(await service.canCopy(source2.resource, target, true), true);
            const res = await service.copy(source2.resource, target, true);
            assert.strictEqual((0, fs_1.existsSync)(res.resource.fsPath), true);
            assert.ok((0, fs_1.readdirSync)(testDir).some(f => f === 'conway.js'));
            assert.strictEqual(source2.size, res.size);
        });
        test('copy - same file', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            assert.ok(source.size > 0);
            assert.strictEqual(await service.canCopy(source.resource, uri_1.URI.file(source.resource.fsPath)), true);
            let copied = await service.copy(source.resource, uri_1.URI.file(source.resource.fsPath));
            assert.strictEqual((0, fs_1.existsSync)(copied.resource.fsPath), true);
            assert.strictEqual((0, path_1.$ae)(copied.resource.fsPath), 'index.html');
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.resource.fsPath);
            assert.strictEqual(event.operation, 3 /* FileOperation.COPY */);
            assert.strictEqual(event.target.resource.fsPath, copied.resource.fsPath);
            copied = await service.resolve(source.resource, { resolveMetadata: true });
            assert.strictEqual(source.size, copied.size);
        });
        test('copy - same file #2', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const source = await service.resolve(uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html')), { resolveMetadata: true });
            assert.ok(source.size > 0);
            const targetParent = uri_1.URI.file(testDir);
            const target = targetParent.with({ path: path_1.$6d.join(targetParent.path, path_1.$6d.basename(source.resource.path)) });
            assert.strictEqual(await service.canCopy(source.resource, uri_1.URI.file(target.fsPath)), true);
            let copied = await service.copy(source.resource, uri_1.URI.file(target.fsPath));
            assert.strictEqual((0, fs_1.existsSync)(copied.resource.fsPath), true);
            assert.strictEqual((0, path_1.$ae)(copied.resource.fsPath), 'index.html');
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, source.resource.fsPath);
            assert.strictEqual(event.operation, 3 /* FileOperation.COPY */);
            assert.strictEqual(event.target.resource.fsPath, copied.resource.fsPath);
            copied = await service.resolve(source.resource, { resolveMetadata: true });
            assert.strictEqual(source.size, copied.size);
        });
        test('cloneFile - basics', () => {
            return testCloneFile();
        });
        test('cloneFile - via copy capability', () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ | 8 /* FileSystemProviderCapabilities.FileFolderCopy */);
            return testCloneFile();
        });
        test('cloneFile - via pipe', () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testCloneFile();
        });
        async function testCloneFile() {
            const source1 = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            const source1Size = (await service.resolve(source1, { resolveMetadata: true })).size;
            const source2 = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const source2Size = (await service.resolve(source2, { resolveMetadata: true })).size;
            const targetParent = uri_1.URI.file(testDir);
            // same path is a no-op
            await service.cloneFile(source1, source1);
            // simple clone to existing parent folder path
            const target1 = targetParent.with({ path: path_1.$6d.join(targetParent.path, `${path_1.$6d.basename(source1.path)}-clone`) });
            await service.cloneFile(source1, uri_1.URI.file(target1.fsPath));
            assert.strictEqual((0, fs_1.existsSync)(target1.fsPath), true);
            assert.strictEqual((0, path_1.$ae)(target1.fsPath), 'index.html-clone');
            let target1Size = (await service.resolve(target1, { resolveMetadata: true })).size;
            assert.strictEqual(source1Size, target1Size);
            // clone to same path overwrites
            await service.cloneFile(source2, uri_1.URI.file(target1.fsPath));
            target1Size = (await service.resolve(target1, { resolveMetadata: true })).size;
            assert.strictEqual(source2Size, target1Size);
            assert.notStrictEqual(source1Size, target1Size);
            // clone creates missing folders ad-hoc
            const target2 = targetParent.with({ path: path_1.$6d.join(targetParent.path, 'foo', 'bar', `${path_1.$6d.basename(source1.path)}-clone`) });
            await service.cloneFile(source1, uri_1.URI.file(target2.fsPath));
            assert.strictEqual((0, fs_1.existsSync)(target2.fsPath), true);
            assert.strictEqual((0, path_1.$ae)(target2.fsPath), 'index.html-clone');
            const target2Size = (await service.resolve(target2, { resolveMetadata: true })).size;
            assert.strictEqual(source1Size, target2Size);
        }
        test('readFile - small file - default', () => {
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFile - small file - buffered', () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFile - small file - buffered / readonly', () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ | 2048 /* FileSystemProviderCapabilities.Readonly */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFile - small file - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFile - small file - unbuffered / readonly', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 2048 /* FileSystemProviderCapabilities.Readonly */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFile - small file - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFile - small file - streamed / readonly', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */ | 2048 /* FileSystemProviderCapabilities.Readonly */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFile - large file - default', async () => {
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt')));
        });
        test('readFile - large file - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt')));
        });
        test('readFile - large file - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt')));
        });
        test('readFile - large file - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt')));
        });
        test('readFile - atomic (emulated on service level)', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt')), { atomic: true });
        });
        test('readFile - atomic (natively supported)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */ & 16384 /* FileSystemProviderCapabilities.FileAtomicRead */);
            return testReadFile(uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt')), { atomic: true });
        });
        async function testReadFile(resource, options) {
            const content = await service.readFile(resource, options);
            assert.strictEqual(content.value.toString(), (0, fs_1.readFileSync)(resource.fsPath).toString());
        }
        test('readFileStream - small file - default', () => {
            return testReadFileStream(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFileStream - small file - buffered', () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testReadFileStream(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFileStream - small file - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testReadFileStream(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        test('readFileStream - small file - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testReadFileStream(uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt')));
        });
        async function testReadFileStream(resource) {
            const content = await service.readFileStream(resource);
            assert.strictEqual((await (0, buffer_1.$Rd)(content.value)).toString(), (0, fs_1.readFileSync)(resource.fsPath).toString());
        }
        test('readFile - Files are intermingled #38331 - default', async () => {
            return testFilesNotIntermingled();
        });
        test('readFile - Files are intermingled #38331 - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testFilesNotIntermingled();
        });
        test('readFile - Files are intermingled #38331 - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testFilesNotIntermingled();
        });
        test('readFile - Files are intermingled #38331 - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testFilesNotIntermingled();
        });
        async function testFilesNotIntermingled() {
            const resource1 = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const resource2 = uri_1.URI.file((0, path_1.$9d)(testDir, 'some_utf16le.css'));
            // load in sequence and keep data
            const value1 = await service.readFile(resource1);
            const value2 = await service.readFile(resource2);
            // load in parallel in expect the same result
            const result = await Promise.all([
                service.readFile(resource1),
                service.readFile(resource2)
            ]);
            assert.strictEqual(result[0].value.toString(), value1.value.toString());
            assert.strictEqual(result[1].value.toString(), value2.value.toString());
        }
        test('readFile - from position (ASCII) - default', async () => {
            return testReadFileFromPositionAscii();
        });
        test('readFile - from position (ASCII) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testReadFileFromPositionAscii();
        });
        test('readFile - from position (ASCII) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testReadFileFromPositionAscii();
        });
        test('readFile - from position (ASCII) - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testReadFileFromPositionAscii();
        });
        async function testReadFileFromPositionAscii() {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const contents = await service.readFile(resource, { position: 6 });
            assert.strictEqual(contents.value.toString(), 'File');
        }
        test('readFile - from position (with umlaut) - default', async () => {
            return testReadFileFromPositionUmlaut();
        });
        test('readFile - from position (with umlaut) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testReadFileFromPositionUmlaut();
        });
        test('readFile - from position (with umlaut) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testReadFileFromPositionUmlaut();
        });
        test('readFile - from position (with umlaut) - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testReadFileFromPositionUmlaut();
        });
        async function testReadFileFromPositionUmlaut() {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small_umlaut.txt'));
            const contents = await service.readFile(resource, { position: Buffer.from('Small File with Ü').length });
            assert.strictEqual(contents.value.toString(), 'mlaut');
        }
        test('readFile - 3 bytes (ASCII) - default', async () => {
            return testReadThreeBytesFromFile();
        });
        test('readFile - 3 bytes (ASCII) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testReadThreeBytesFromFile();
        });
        test('readFile - 3 bytes (ASCII) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testReadThreeBytesFromFile();
        });
        test('readFile - 3 bytes (ASCII) - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testReadThreeBytesFromFile();
        });
        async function testReadThreeBytesFromFile() {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const contents = await service.readFile(resource, { length: 3 });
            assert.strictEqual(contents.value.toString(), 'Sma');
        }
        test('readFile - 20000 bytes (large) - default', async () => {
            return readLargeFileWithLength(20000);
        });
        test('readFile - 20000 bytes (large) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return readLargeFileWithLength(20000);
        });
        test('readFile - 20000 bytes (large) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return readLargeFileWithLength(20000);
        });
        test('readFile - 20000 bytes (large) - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return readLargeFileWithLength(20000);
        });
        test('readFile - 80000 bytes (large) - default', async () => {
            return readLargeFileWithLength(80000);
        });
        test('readFile - 80000 bytes (large) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return readLargeFileWithLength(80000);
        });
        test('readFile - 80000 bytes (large) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return readLargeFileWithLength(80000);
        });
        test('readFile - 80000 bytes (large) - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return readLargeFileWithLength(80000);
        });
        async function readLargeFileWithLength(length) {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const contents = await service.readFile(resource, { length });
            assert.strictEqual(contents.value.byteLength, length);
        }
        test('readFile - FILE_IS_DIRECTORY', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'deep'));
            let error = undefined;
            try {
                await service.readFile(resource);
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
            assert.strictEqual(error.fileOperationResult, 0 /* FileOperationResult.FILE_IS_DIRECTORY */);
        });
        (platform_1.$i /* error code does not seem to be supported on windows */ ? test.skip : test)('readFile - FILE_NOT_DIRECTORY', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt', 'file.txt'));
            let error = undefined;
            try {
                await service.readFile(resource);
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
            assert.strictEqual(error.fileOperationResult, 9 /* FileOperationResult.FILE_NOT_DIRECTORY */);
        });
        test('readFile - FILE_NOT_FOUND', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, '404.html'));
            let error = undefined;
            try {
                await service.readFile(resource);
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
            assert.strictEqual(error.fileOperationResult, 1 /* FileOperationResult.FILE_NOT_FOUND */);
        });
        test('readFile - FILE_NOT_MODIFIED_SINCE - default', async () => {
            return testNotModifiedSince();
        });
        test('readFile - FILE_NOT_MODIFIED_SINCE - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testNotModifiedSince();
        });
        test('readFile - FILE_NOT_MODIFIED_SINCE - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testNotModifiedSince();
        });
        test('readFile - FILE_NOT_MODIFIED_SINCE - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testNotModifiedSince();
        });
        async function testNotModifiedSince() {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            const contents = await service.readFile(resource);
            fileProvider.totalBytesRead = 0;
            let error = undefined;
            try {
                await service.readFile(resource, { etag: contents.etag });
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
            assert.strictEqual(error.fileOperationResult, 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */);
            assert.ok(error instanceof files_1.$pk && error.stat);
            assert.strictEqual(fileProvider.totalBytesRead, 0);
        }
        test('readFile - FILE_NOT_MODIFIED_SINCE does not fire wrongly - https://github.com/microsoft/vscode/issues/72909', async () => {
            fileProvider.setInvalidStatSize(true);
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            await service.readFile(resource);
            let error = undefined;
            try {
                await service.readFile(resource, { etag: undefined });
            }
            catch (err) {
                error = err;
            }
            assert.ok(!error);
        });
        test('readFile - FILE_TOO_LARGE - default', async () => {
            return testFileTooLarge();
        });
        test('readFile - FILE_TOO_LARGE - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testFileTooLarge();
        });
        test('readFile - FILE_TOO_LARGE - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testFileTooLarge();
        });
        test('readFile - FILE_TOO_LARGE - streamed', async () => {
            setCapabilities(fileProvider, 16 /* FileSystemProviderCapabilities.FileReadStream */);
            return testFileTooLarge();
        });
        async function testFileTooLarge() {
            await doTestFileTooLarge(false);
            // Also test when the stat size is wrong
            fileProvider.setSmallStatSize(true);
            return doTestFileTooLarge(true);
        }
        async function doTestFileTooLarge(statSizeWrong) {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            let error = undefined;
            try {
                await service.readFile(resource, { limits: { size: 10 } });
            }
            catch (err) {
                error = err;
            }
            if (!statSizeWrong) {
                assert.ok(error instanceof files_1.$ok);
                assert.ok(typeof error.size === 'number');
            }
            assert.strictEqual(error.fileOperationResult, 7 /* FileOperationResult.FILE_TOO_LARGE */);
        }
        (platform_1.$i ? test.skip /* windows: cannot create file symbolic link without elevated context */ : test)('readFile - dangling symbolic link - https://github.com/microsoft/vscode/issues/116049', async () => {
            const link = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.js-link'));
            await pfs_1.Promises.symlink((0, path_1.$9d)(testDir, 'small.js'), link.fsPath);
            let error = undefined;
            try {
                await service.readFile(link);
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
        });
        test('createFile', async () => {
            return assertCreateFile(contents => buffer_1.$Fd.fromString(contents));
        });
        test('createFile (readable)', async () => {
            return assertCreateFile(contents => (0, buffer_1.$Qd)(buffer_1.$Fd.fromString(contents)));
        });
        test('createFile (stream)', async () => {
            return assertCreateFile(contents => (0, buffer_1.$Td)(buffer_1.$Fd.fromString(contents)));
        });
        async function assertCreateFile(converter) {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const contents = 'Hello World';
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'test.txt'));
            assert.strictEqual(await service.canCreateFile(resource), true);
            const fileStat = await service.createFile(resource, converter(contents));
            assert.strictEqual(fileStat.name, 'test.txt');
            assert.strictEqual((0, fs_1.existsSync)(fileStat.resource.fsPath), true);
            assert.strictEqual((0, fs_1.readFileSync)(fileStat.resource.fsPath).toString(), contents);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, resource.fsPath);
            assert.strictEqual(event.operation, 0 /* FileOperation.CREATE */);
            assert.strictEqual(event.target.resource.fsPath, resource.fsPath);
        }
        test('createFile (does not overwrite by default)', async () => {
            const contents = 'Hello World';
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'test.txt'));
            (0, fs_1.writeFileSync)(resource.fsPath, ''); // create file
            assert.ok((await service.canCreateFile(resource)) instanceof Error);
            let error;
            try {
                await service.createFile(resource, buffer_1.$Fd.fromString(contents));
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
        });
        test('createFile (allows to overwrite existing)', async () => {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const contents = 'Hello World';
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'test.txt'));
            (0, fs_1.writeFileSync)(resource.fsPath, ''); // create file
            assert.strictEqual(await service.canCreateFile(resource, { overwrite: true }), true);
            const fileStat = await service.createFile(resource, buffer_1.$Fd.fromString(contents), { overwrite: true });
            assert.strictEqual(fileStat.name, 'test.txt');
            assert.strictEqual((0, fs_1.existsSync)(fileStat.resource.fsPath), true);
            assert.strictEqual((0, fs_1.readFileSync)(fileStat.resource.fsPath).toString(), contents);
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, resource.fsPath);
            assert.strictEqual(event.operation, 0 /* FileOperation.CREATE */);
            assert.strictEqual(event.target.resource.fsPath, resource.fsPath);
        });
        test('writeFile - default', async () => {
            return testWriteFile(false);
        });
        test('writeFile - flush on write', async () => {
            diskFileSystemProvider_1.$3p.configureFlushOnWrite(true);
            try {
                return await testWriteFile(false);
            }
            finally {
                diskFileSystemProvider_1.$3p.configureFlushOnWrite(false);
            }
        });
        test('writeFile - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testWriteFile(false);
        });
        test('writeFile - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testWriteFile(false);
        });
        test('writeFile - default (atomic)', async () => {
            return testWriteFile(true);
        });
        test('writeFile - flush on write (atomic)', async () => {
            diskFileSystemProvider_1.$3p.configureFlushOnWrite(true);
            try {
                return await testWriteFile(true);
            }
            finally {
                diskFileSystemProvider_1.$3p.configureFlushOnWrite(false);
            }
        });
        test('writeFile - buffered (atomic)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ | 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */);
            return testWriteFile(true);
        });
        test('writeFile - unbuffered (atomic)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */);
            return testWriteFile(true);
        });
        async function testWriteFile(atomic) {
            let event;
            disposables.add(service.onDidRunOperation(e => event = e));
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const content = (0, fs_1.readFileSync)(resource.fsPath).toString();
            assert.strictEqual(content, 'Small File');
            const newContent = 'Updates to the small file';
            await service.writeFile(resource, buffer_1.$Fd.fromString(newContent), { atomic: atomic ? { postfix: '.vsctmp' } : false });
            assert.ok(event);
            assert.strictEqual(event.resource.fsPath, resource.fsPath);
            assert.strictEqual(event.operation, 4 /* FileOperation.WRITE */);
            assert.strictEqual((0, fs_1.readFileSync)(resource.fsPath).toString(), newContent);
        }
        test('writeFile (large file) - default', async () => {
            return testWriteFileLarge(false);
        });
        test('writeFile (large file) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testWriteFileLarge(false);
        });
        test('writeFile (large file) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testWriteFileLarge(false);
        });
        test('writeFile (large file) - default (atomic)', async () => {
            return testWriteFileLarge(true);
        });
        test('writeFile (large file) - buffered (atomic)', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ | 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */);
            return testWriteFileLarge(true);
        });
        test('writeFile (large file) - unbuffered (atomic)', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */);
            return testWriteFileLarge(true);
        });
        async function testWriteFileLarge(atomic) {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const content = (0, fs_1.readFileSync)(resource.fsPath);
            const newContent = content.toString() + content.toString();
            const fileStat = await service.writeFile(resource, buffer_1.$Fd.fromString(newContent), { atomic: atomic ? { postfix: '.vsctmp' } : false });
            assert.strictEqual(fileStat.name, 'lorem.txt');
            assert.strictEqual((0, fs_1.readFileSync)(resource.fsPath).toString(), newContent);
        }
        test('writeFile - buffered - readonly throws', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ | 2048 /* FileSystemProviderCapabilities.Readonly */);
            return testWriteFileReadonlyThrows();
        });
        test('writeFile - unbuffered - readonly throws', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 2048 /* FileSystemProviderCapabilities.Readonly */);
            return testWriteFileReadonlyThrows();
        });
        async function testWriteFileReadonlyThrows() {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const content = (0, fs_1.readFileSync)(resource.fsPath).toString();
            assert.strictEqual(content, 'Small File');
            const newContent = 'Updates to the small file';
            let error;
            try {
                await service.writeFile(resource, buffer_1.$Fd.fromString(newContent));
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
        }
        test('writeFile (large file) - multiple parallel writes queue up and atomic read support (via file service)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const content = (0, fs_1.readFileSync)(resource.fsPath);
            const newContent = content.toString() + content.toString();
            const writePromises = Promise.all(['0', '00', '000', '0000', '00000'].map(async (offset) => {
                const fileStat = await service.writeFile(resource, buffer_1.$Fd.fromString(offset + newContent));
                assert.strictEqual(fileStat.name, 'lorem.txt');
            }));
            const readPromises = Promise.all(['0', '00', '000', '0000', '00000'].map(async () => {
                const fileContent = await service.readFile(resource, { atomic: true });
                assert.ok(fileContent.value.byteLength > 0); // `atomic: true` ensures we never read a truncated file
            }));
            await Promise.all([writePromises, readPromises]);
        });
        test('provider - write barrier prevents dirty writes', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const content = (0, fs_1.readFileSync)(resource.fsPath);
            const newContent = content.toString() + content.toString();
            const provider = service.getProvider(resource.scheme);
            assert.ok(provider);
            assert.ok((0, files_1.$$j)(provider));
            const writePromises = Promise.all(['0', '00', '000', '0000', '00000'].map(async (offset) => {
                const content = offset + newContent;
                const contentBuffer = buffer_1.$Fd.fromString(content).buffer;
                const fd = await provider.open(resource, { create: true, unlock: false });
                try {
                    await provider.write(fd, 0, buffer_1.$Fd.fromString(content).buffer, 0, contentBuffer.byteLength);
                    // Here since `close` is not called, all other writes are
                    // waiting on the barrier to release, so doing a readFile
                    // should give us a consistent view of the file contents
                    assert.strictEqual((await pfs_1.Promises.readFile(resource.fsPath)).toString(), content);
                }
                finally {
                    await provider.close(fd);
                }
            }));
            await Promise.all([writePromises]);
        });
        test('provider - write barrier is partitioned per resource', async () => {
            const resource1 = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const resource2 = uri_1.URI.file((0, path_1.$9d)(testDir, 'test.txt'));
            const provider = service.getProvider(resource1.scheme);
            assert.ok(provider);
            assert.ok((0, files_1.$$j)(provider));
            const fd1 = await provider.open(resource1, { create: true, unlock: false });
            const fd2 = await provider.open(resource2, { create: true, unlock: false });
            const newContent = 'Hello World';
            try {
                await provider.write(fd1, 0, buffer_1.$Fd.fromString(newContent).buffer, 0, buffer_1.$Fd.fromString(newContent).buffer.byteLength);
                assert.strictEqual((await pfs_1.Promises.readFile(resource1.fsPath)).toString(), newContent);
                await provider.write(fd2, 0, buffer_1.$Fd.fromString(newContent).buffer, 0, buffer_1.$Fd.fromString(newContent).buffer.byteLength);
                assert.strictEqual((await pfs_1.Promises.readFile(resource2.fsPath)).toString(), newContent);
            }
            finally {
                await Promise.allSettled([
                    await provider.close(fd1),
                    await provider.close(fd2)
                ]);
            }
        });
        test('provider - write barrier not becoming stale', async () => {
            const newFolder = (0, path_1.$9d)(testDir, 'new-folder');
            const newResource = uri_1.URI.file((0, path_1.$9d)(newFolder, 'lorem.txt'));
            const provider = service.getProvider(newResource.scheme);
            assert.ok(provider);
            assert.ok((0, files_1.$$j)(provider));
            let error = undefined;
            try {
                await provider.open(newResource, { create: true, unlock: false });
            }
            catch (e) {
                error = e;
            }
            assert.ok(error); // expected because `new-folder` does not exist
            await pfs_1.Promises.mkdir(newFolder);
            const content = (0, fs_1.readFileSync)(uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt')).fsPath);
            const newContent = content.toString() + content.toString();
            const newContentBuffer = buffer_1.$Fd.fromString(newContent).buffer;
            const fd = await provider.open(newResource, { create: true, unlock: false });
            try {
                await provider.write(fd, 0, newContentBuffer, 0, newContentBuffer.byteLength);
                assert.strictEqual((await pfs_1.Promises.readFile(newResource.fsPath)).toString(), newContent);
            }
            finally {
                await provider.close(fd);
            }
        });
        test('provider - atomic reads (write pending when read starts)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const content = (0, fs_1.readFileSync)(resource.fsPath);
            const newContent = content.toString() + content.toString();
            const newContentBuffer = buffer_1.$Fd.fromString(newContent).buffer;
            const provider = service.getProvider(resource.scheme);
            assert.ok(provider);
            assert.ok((0, files_1.$$j)(provider));
            assert.ok((0, files_1.$ak)(provider));
            let atomicReadPromise = undefined;
            const fd = await provider.open(resource, { create: true, unlock: false });
            try {
                // Start reading while write is pending
                atomicReadPromise = provider.readFile(resource, { atomic: true });
                // Simulate a slow write, giving the read
                // a chance to succeed if it were not atomic
                await (0, async_1.$Hg)(20);
                await provider.write(fd, 0, newContentBuffer, 0, newContentBuffer.byteLength);
            }
            finally {
                await provider.close(fd);
            }
            assert.ok(atomicReadPromise);
            const atomicReadResult = await atomicReadPromise;
            assert.strictEqual(atomicReadResult.byteLength, newContentBuffer.byteLength);
        });
        test('provider - atomic reads (read pending when write starts)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const content = (0, fs_1.readFileSync)(resource.fsPath);
            const newContent = content.toString() + content.toString();
            const newContentBuffer = buffer_1.$Fd.fromString(newContent).buffer;
            const provider = service.getProvider(resource.scheme);
            assert.ok(provider);
            assert.ok((0, files_1.$$j)(provider));
            assert.ok((0, files_1.$ak)(provider));
            let atomicReadPromise = provider.readFile(resource, { atomic: true });
            const fdPromise = provider.open(resource, { create: true, unlock: false }).then(async (fd) => {
                try {
                    return await provider.write(fd, 0, newContentBuffer, 0, newContentBuffer.byteLength);
                }
                finally {
                    await provider.close(fd);
                }
            });
            let atomicReadResult = await atomicReadPromise;
            assert.strictEqual(atomicReadResult.byteLength, content.byteLength);
            await fdPromise;
            atomicReadPromise = provider.readFile(resource, { atomic: true });
            atomicReadResult = await atomicReadPromise;
            assert.strictEqual(atomicReadResult.byteLength, newContentBuffer.byteLength);
        });
        test('writeFile (readable) - default', async () => {
            return testWriteFileReadable();
        });
        test('writeFile (readable) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testWriteFileReadable();
        });
        test('writeFile (readable) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testWriteFileReadable();
        });
        async function testWriteFileReadable() {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const content = (0, fs_1.readFileSync)(resource.fsPath).toString();
            assert.strictEqual(content, 'Small File');
            const newContent = 'Updates to the small file';
            await service.writeFile(resource, toLineByLineReadable(newContent));
            assert.strictEqual((0, fs_1.readFileSync)(resource.fsPath).toString(), newContent);
        }
        test('writeFile (large file - readable) - default', async () => {
            return testWriteFileLargeReadable();
        });
        test('writeFile (large file - readable) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testWriteFileLargeReadable();
        });
        test('writeFile (large file - readable) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testWriteFileLargeReadable();
        });
        async function testWriteFileLargeReadable() {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const content = (0, fs_1.readFileSync)(resource.fsPath);
            const newContent = content.toString() + content.toString();
            const fileStat = await service.writeFile(resource, toLineByLineReadable(newContent));
            assert.strictEqual(fileStat.name, 'lorem.txt');
            assert.strictEqual((0, fs_1.readFileSync)(resource.fsPath).toString(), newContent);
        }
        test('writeFile (stream) - default', async () => {
            return testWriteFileStream();
        });
        test('writeFile (stream) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testWriteFileStream();
        });
        test('writeFile (stream) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testWriteFileStream();
        });
        async function testWriteFileStream() {
            const source = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const target = uri_1.URI.file((0, path_1.$9d)(testDir, 'small-copy.txt'));
            const fileStat = await service.writeFile(target, (0, buffer_1.$Ud)((0, fs_1.createReadStream)(source.fsPath)));
            assert.strictEqual(fileStat.name, 'small-copy.txt');
            const targetContents = (0, fs_1.readFileSync)(target.fsPath).toString();
            assert.strictEqual((0, fs_1.readFileSync)(source.fsPath).toString(), targetContents);
        }
        test('writeFile (large file - stream) - default', async () => {
            return testWriteFileLargeStream();
        });
        test('writeFile (large file - stream) - buffered', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testWriteFileLargeStream();
        });
        test('writeFile (large file - stream) - unbuffered', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testWriteFileLargeStream();
        });
        async function testWriteFileLargeStream() {
            const source = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const target = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem-copy.txt'));
            const fileStat = await service.writeFile(target, (0, buffer_1.$Ud)((0, fs_1.createReadStream)(source.fsPath)));
            assert.strictEqual(fileStat.name, 'lorem-copy.txt');
            const targetContents = (0, fs_1.readFileSync)(target.fsPath).toString();
            assert.strictEqual((0, fs_1.readFileSync)(source.fsPath).toString(), targetContents);
        }
        test('writeFile (file is created including parents)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'other', 'newfile.txt'));
            const content = 'File is created including parent';
            const fileStat = await service.writeFile(resource, buffer_1.$Fd.fromString(content));
            assert.strictEqual(fileStat.name, 'newfile.txt');
            assert.strictEqual((0, fs_1.readFileSync)(resource.fsPath).toString(), content);
        });
        test('writeFile - locked files and unlocking', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 8192 /* FileSystemProviderCapabilities.FileWriteUnlock */);
            return testLockedFiles(false);
        });
        test('writeFile (stream) - locked files and unlocking', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */ | 8192 /* FileSystemProviderCapabilities.FileWriteUnlock */);
            return testLockedFiles(false);
        });
        test('writeFile - locked files and unlocking throws error when missing capability', async () => {
            setCapabilities(fileProvider, 2 /* FileSystemProviderCapabilities.FileReadWrite */);
            return testLockedFiles(true);
        });
        test('writeFile (stream) - locked files and unlocking throws error when missing capability', async () => {
            setCapabilities(fileProvider, 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */);
            return testLockedFiles(true);
        });
        async function testLockedFiles(expectError) {
            const lockedFile = uri_1.URI.file((0, path_1.$9d)(testDir, 'my-locked-file'));
            const content = await service.writeFile(lockedFile, buffer_1.$Fd.fromString('Locked File'));
            assert.strictEqual(content.locked, false);
            const stats = await pfs_1.Promises.stat(lockedFile.fsPath);
            await pfs_1.Promises.chmod(lockedFile.fsPath, stats.mode & ~0o200);
            let stat = await service.stat(lockedFile);
            assert.strictEqual(stat.locked, true);
            let error;
            const newContent = 'Updates to locked file';
            try {
                await service.writeFile(lockedFile, buffer_1.$Fd.fromString(newContent));
            }
            catch (e) {
                error = e;
            }
            assert.ok(error);
            error = undefined;
            if (expectError) {
                try {
                    await service.writeFile(lockedFile, buffer_1.$Fd.fromString(newContent), { unlock: true });
                }
                catch (e) {
                    error = e;
                }
                assert.ok(error);
            }
            else {
                await service.writeFile(lockedFile, buffer_1.$Fd.fromString(newContent), { unlock: true });
                assert.strictEqual((0, fs_1.readFileSync)(lockedFile.fsPath).toString(), newContent);
                stat = await service.stat(lockedFile);
                assert.strictEqual(stat.locked, false);
            }
        }
        test('writeFile (error when folder is encountered)', async () => {
            const resource = uri_1.URI.file(testDir);
            let error = undefined;
            try {
                await service.writeFile(resource, buffer_1.$Fd.fromString('File is created including parent'));
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
        });
        test('writeFile (no error when providing up to date etag)', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const stat = await service.resolve(resource);
            const content = (0, fs_1.readFileSync)(resource.fsPath).toString();
            assert.strictEqual(content, 'Small File');
            const newContent = 'Updates to the small file';
            await service.writeFile(resource, buffer_1.$Fd.fromString(newContent), { etag: stat.etag, mtime: stat.mtime });
            assert.strictEqual((0, fs_1.readFileSync)(resource.fsPath).toString(), newContent);
        });
        test('writeFile - error when writing to file that has been updated meanwhile', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const stat = await service.resolve(resource);
            const content = (0, fs_1.readFileSync)(resource.fsPath).toString();
            assert.strictEqual(content, 'Small File');
            const newContent = 'Updates to the small file';
            await service.writeFile(resource, buffer_1.$Fd.fromString(newContent), { etag: stat.etag, mtime: stat.mtime });
            const newContentLeadingToError = newContent + newContent;
            const fakeMtime = 1000;
            const fakeSize = 1000;
            let error = undefined;
            try {
                await service.writeFile(resource, buffer_1.$Fd.fromString(newContentLeadingToError), { etag: (0, files_1.$yk)({ mtime: fakeMtime, size: fakeSize }), mtime: fakeMtime });
            }
            catch (err) {
                error = err;
            }
            assert.ok(error);
            assert.ok(error instanceof files_1.$nk);
            assert.strictEqual(error.fileOperationResult, 3 /* FileOperationResult.FILE_MODIFIED_SINCE */);
        });
        test('writeFile - no error when writing to file where size is the same', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'small.txt'));
            const stat = await service.resolve(resource);
            const content = (0, fs_1.readFileSync)(resource.fsPath).toString();
            assert.strictEqual(content, 'Small File');
            const newContent = content; // same content
            await service.writeFile(resource, buffer_1.$Fd.fromString(newContent), { etag: stat.etag, mtime: stat.mtime });
            const newContentLeadingToNoError = newContent; // writing the same content should be OK
            const fakeMtime = 1000;
            const actualSize = newContent.length;
            let error = undefined;
            try {
                await service.writeFile(resource, buffer_1.$Fd.fromString(newContentLeadingToNoError), { etag: (0, files_1.$yk)({ mtime: fakeMtime, size: actualSize }), mtime: fakeMtime });
            }
            catch (err) {
                error = err;
            }
            assert.ok(!error);
        });
        test('writeFile - no error when writing to same nonexistent folder multiple times different new files', async () => {
            const newFolder = uri_1.URI.file((0, path_1.$9d)(testDir, 'some', 'new', 'folder'));
            const file1 = (0, resources_1.$ig)(newFolder, 'file-1');
            const file2 = (0, resources_1.$ig)(newFolder, 'file-2');
            const file3 = (0, resources_1.$ig)(newFolder, 'file-3');
            // this essentially verifies that the mkdirp logic implemented
            // in the file service is able to receive multiple requests for
            // the same folder and will not throw errors if another racing
            // call succeeded first.
            const newContent = 'Updates to the small file';
            await Promise.all([
                service.writeFile(file1, buffer_1.$Fd.fromString(newContent)),
                service.writeFile(file2, buffer_1.$Fd.fromString(newContent)),
                service.writeFile(file3, buffer_1.$Fd.fromString(newContent))
            ]);
            assert.ok(service.exists(file1));
            assert.ok(service.exists(file2));
            assert.ok(service.exists(file3));
        });
        test('writeFile - error when writing to folder that is a file', async () => {
            const existingFile = uri_1.URI.file((0, path_1.$9d)(testDir, 'my-file'));
            await service.createFile(existingFile);
            const newFile = (0, resources_1.$ig)(existingFile, 'file-1');
            let error;
            const newContent = 'Updates to the small file';
            try {
                await service.writeFile(newFile, buffer_1.$Fd.fromString(newContent));
            }
            catch (e) {
                error = e;
            }
            assert.ok(error);
        });
        test('read - mixed positions', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            // read multiple times from position 0
            let buffer = buffer_1.$Fd.alloc(1024);
            let fd = await fileProvider.open(resource, { create: false });
            for (let i = 0; i < 3; i++) {
                await fileProvider.read(fd, 0, buffer.buffer, 0, 26);
                assert.strictEqual(buffer.slice(0, 26).toString(), 'Lorem ipsum dolor sit amet');
            }
            await fileProvider.close(fd);
            // read multiple times at various locations
            buffer = buffer_1.$Fd.alloc(1024);
            fd = await fileProvider.open(resource, { create: false });
            let posInFile = 0;
            await fileProvider.read(fd, posInFile, buffer.buffer, 0, 26);
            assert.strictEqual(buffer.slice(0, 26).toString(), 'Lorem ipsum dolor sit amet');
            posInFile += 26;
            await fileProvider.read(fd, posInFile, buffer.buffer, 0, 1);
            assert.strictEqual(buffer.slice(0, 1).toString(), ',');
            posInFile += 1;
            await fileProvider.read(fd, posInFile, buffer.buffer, 0, 12);
            assert.strictEqual(buffer.slice(0, 12).toString(), ' consectetur');
            posInFile += 12;
            await fileProvider.read(fd, 98 /* no longer in sequence of posInFile */, buffer.buffer, 0, 9);
            assert.strictEqual(buffer.slice(0, 9).toString(), 'fermentum');
            await fileProvider.read(fd, 27, buffer.buffer, 0, 12);
            assert.strictEqual(buffer.slice(0, 12).toString(), ' consectetur');
            await fileProvider.read(fd, 26, buffer.buffer, 0, 1);
            assert.strictEqual(buffer.slice(0, 1).toString(), ',');
            await fileProvider.read(fd, 0, buffer.buffer, 0, 26);
            assert.strictEqual(buffer.slice(0, 26).toString(), 'Lorem ipsum dolor sit amet');
            await fileProvider.read(fd, posInFile /* back in sequence */, buffer.buffer, 0, 11);
            assert.strictEqual(buffer.slice(0, 11).toString(), ' adipiscing');
            await fileProvider.close(fd);
        });
        test('write - mixed positions', async () => {
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'lorem.txt'));
            const buffer = buffer_1.$Fd.alloc(1024);
            const fdWrite = await fileProvider.open(resource, { create: true, unlock: false });
            const fdRead = await fileProvider.open(resource, { create: false });
            let posInFileWrite = 0;
            let posInFileRead = 0;
            const initialContents = buffer_1.$Fd.fromString('Lorem ipsum dolor sit amet');
            await fileProvider.write(fdWrite, posInFileWrite, initialContents.buffer, 0, initialContents.byteLength);
            posInFileWrite += initialContents.byteLength;
            await fileProvider.read(fdRead, posInFileRead, buffer.buffer, 0, 26);
            assert.strictEqual(buffer.slice(0, 26).toString(), 'Lorem ipsum dolor sit amet');
            posInFileRead += 26;
            const contents = buffer_1.$Fd.fromString('Hello World');
            await fileProvider.write(fdWrite, posInFileWrite, contents.buffer, 0, contents.byteLength);
            posInFileWrite += contents.byteLength;
            await fileProvider.read(fdRead, posInFileRead, buffer.buffer, 0, contents.byteLength);
            assert.strictEqual(buffer.slice(0, contents.byteLength).toString(), 'Hello World');
            posInFileRead += contents.byteLength;
            await fileProvider.write(fdWrite, 6, contents.buffer, 0, contents.byteLength);
            await fileProvider.read(fdRead, 0, buffer.buffer, 0, 11);
            assert.strictEqual(buffer.slice(0, 11).toString(), 'Lorem Hello');
            await fileProvider.write(fdWrite, posInFileWrite, contents.buffer, 0, contents.byteLength);
            posInFileWrite += contents.byteLength;
            await fileProvider.read(fdRead, posInFileWrite - contents.byteLength, buffer.buffer, 0, contents.byteLength);
            assert.strictEqual(buffer.slice(0, contents.byteLength).toString(), 'Hello World');
            await fileProvider.close(fdWrite);
            await fileProvider.close(fdRead);
        });
        test('readonly - is handled properly for a single resource', async () => {
            fileProvider.setReadonly(true);
            const resource = uri_1.URI.file((0, path_1.$9d)(testDir, 'index.html'));
            const resolveResult = await service.resolve(resource);
            assert.strictEqual(resolveResult.readonly, true);
            const readResult = await service.readFile(resource);
            assert.strictEqual(readResult.readonly, true);
            let writeFileError = undefined;
            try {
                await service.writeFile(resource, buffer_1.$Fd.fromString('Hello Test'));
            }
            catch (error) {
                writeFileError = error;
            }
            assert.ok(writeFileError);
            let deleteFileError = undefined;
            try {
                await service.del(resource);
            }
            catch (error) {
                deleteFileError = error;
            }
            assert.ok(deleteFileError);
        });
    });
});
//# sourceMappingURL=diskFileService.integrationTest.js.map