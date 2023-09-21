/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "crypto", "fs", "os", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/node/pfs", "vs/base/test/node/testUtils", "vs/platform/backup/electron-main/backupMainService", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argv", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/backup/common/backup", "vs/platform/test/electron-main/workbenchTestServices", "vs/platform/log/common/logService", "vs/base/test/common/utils"], function (require, exports, assert, crypto_1, fs, os, network_1, path, platform, resources_1, uri_1, pfs_1, testUtils_1, backupMainService_1, testConfigurationService_1, environmentMainService_1, argv_1, files_1, log_1, product_1, backup_1, workbenchTestServices_1, logService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('BackupMainService', () => {
        function assertEqualFolderInfos(actual, expected) {
            const withUriAsString = (f) => ({ folderUri: f.folderUri.toString(), remoteAuthority: f.remoteAuthority });
            assert.deepStrictEqual(actual.map(withUriAsString), expected.map(withUriAsString));
        }
        function toWorkspace(path) {
            return {
                id: (0, crypto_1.createHash)('md5').update(sanitizePath(path)).digest('hex'),
                configPath: uri_1.URI.file(path)
            };
        }
        function toWorkspaceBackupInfo(path, remoteAuthority) {
            return {
                workspace: {
                    id: (0, crypto_1.createHash)('md5').update(sanitizePath(path)).digest('hex'),
                    configPath: uri_1.URI.file(path)
                },
                remoteAuthority
            };
        }
        function toFolderBackupInfo(uri, remoteAuthority) {
            return { folderUri: uri, remoteAuthority };
        }
        function toSerializedWorkspace(ws) {
            return {
                id: ws.id,
                configURIPath: ws.configPath.toString()
            };
        }
        function ensureFolderExists(uri) {
            if (!fs.existsSync(uri.fsPath)) {
                fs.mkdirSync(uri.fsPath);
            }
            const backupFolder = service.toBackupPath(uri);
            return createBackupFolder(backupFolder);
        }
        async function ensureWorkspaceExists(workspace) {
            if (!fs.existsSync(workspace.configPath.fsPath)) {
                await pfs_1.Promises.writeFile(workspace.configPath.fsPath, 'Hello');
            }
            const backupFolder = service.toBackupPath(workspace.id);
            await createBackupFolder(backupFolder);
            return workspace;
        }
        async function createBackupFolder(backupFolder) {
            if (!fs.existsSync(backupFolder)) {
                fs.mkdirSync(backupFolder);
                fs.mkdirSync(path.$9d(backupFolder, network_1.Schemas.file));
                await pfs_1.Promises.writeFile(path.$9d(backupFolder, network_1.Schemas.file, 'foo.txt'), 'Hello');
            }
        }
        function readWorkspacesMetadata() {
            return stateMainService.getItem('backupWorkspaces');
        }
        function writeWorkspacesMetadata(data) {
            if (!data) {
                stateMainService.removeItem('backupWorkspaces');
            }
            else {
                stateMainService.setItem('backupWorkspaces', JSON.parse(data));
            }
        }
        function sanitizePath(p) {
            return platform.$k ? p : p.toLowerCase();
        }
        const fooFile = uri_1.URI.file(platform.$i ? 'C:\\foo' : '/foo');
        const barFile = uri_1.URI.file(platform.$i ? 'C:\\bar' : '/bar');
        let service;
        let configService;
        let stateMainService;
        let environmentService;
        let testDir;
        let backupHome;
        let existingTestFolder1;
        setup(async () => {
            testDir = (0, testUtils_1.$oT)(os.tmpdir(), 'vsctests', 'backupmainservice');
            backupHome = path.$9d(testDir, 'Backups');
            existingTestFolder1 = uri_1.URI.file(path.$9d(testDir, 'folder1'));
            environmentService = new environmentMainService_1.$o5b((0, argv_1.$zl)(process.argv, argv_1.$yl), { _serviceBrand: undefined, ...product_1.default });
            await pfs_1.Promises.mkdir(backupHome, { recursive: true });
            configService = new testConfigurationService_1.$G0b();
            stateMainService = new workbenchTestServices_1.$r$b();
            service = new class TestBackupMainService extends backupMainService_1.$L5b {
                constructor() {
                    super(environmentService, configService, new logService_1.$mN(new log_1.$_i()), stateMainService);
                    this.c = backupHome;
                }
                toBackupPath(arg) {
                    const id = arg instanceof uri_1.URI ? super.D({ folderUri: arg }) : arg;
                    return path.$9d(this.c, id);
                }
                testGetFolderHash(folder) {
                    return super.D(folder);
                }
                testGetWorkspaceBackups() {
                    return super.n();
                }
                testGetFolderBackups() {
                    return super.o();
                }
            };
            return service.initialize();
        });
        teardown(() => {
            return pfs_1.Promises.rm(testDir);
        });
        test('service validates backup workspaces on startup and cleans up (folder workspaces)', async function () {
            // 1) backup workspace path does not exist
            service.registerFolderBackup(toFolderBackupInfo(fooFile));
            service.registerFolderBackup(toFolderBackupInfo(barFile));
            await service.initialize();
            assertEqualFolderInfos(service.testGetFolderBackups(), []);
            // 2) backup workspace path exists with empty contents within
            fs.mkdirSync(service.toBackupPath(fooFile));
            fs.mkdirSync(service.toBackupPath(barFile));
            service.registerFolderBackup(toFolderBackupInfo(fooFile));
            service.registerFolderBackup(toFolderBackupInfo(barFile));
            await service.initialize();
            assertEqualFolderInfos(service.testGetFolderBackups(), []);
            assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
            assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
            // 3) backup workspace path exists with empty folders within
            fs.mkdirSync(service.toBackupPath(fooFile));
            fs.mkdirSync(service.toBackupPath(barFile));
            fs.mkdirSync(path.$9d(service.toBackupPath(fooFile), network_1.Schemas.file));
            fs.mkdirSync(path.$9d(service.toBackupPath(barFile), network_1.Schemas.untitled));
            service.registerFolderBackup(toFolderBackupInfo(fooFile));
            service.registerFolderBackup(toFolderBackupInfo(barFile));
            await service.initialize();
            assertEqualFolderInfos(service.testGetFolderBackups(), []);
            assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
            assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
            // 4) backup workspace path points to a workspace that no longer exists
            // so it should convert the backup worspace to an empty workspace backup
            const fileBackups = path.$9d(service.toBackupPath(fooFile), network_1.Schemas.file);
            fs.mkdirSync(service.toBackupPath(fooFile));
            fs.mkdirSync(service.toBackupPath(barFile));
            fs.mkdirSync(fileBackups);
            service.registerFolderBackup(toFolderBackupInfo(fooFile));
            assert.strictEqual(service.testGetFolderBackups().length, 1);
            assert.strictEqual(service.getEmptyWindowBackups().length, 0);
            fs.writeFileSync(path.$9d(fileBackups, 'backup.txt'), '');
            await service.initialize();
            assert.strictEqual(service.testGetFolderBackups().length, 0);
            assert.strictEqual(service.getEmptyWindowBackups().length, 1);
        });
        test('service validates backup workspaces on startup and cleans up (root workspaces)', async function () {
            // 1) backup workspace path does not exist
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath));
            await service.initialize();
            assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
            // 2) backup workspace path exists with empty contents within
            fs.mkdirSync(service.toBackupPath(fooFile));
            fs.mkdirSync(service.toBackupPath(barFile));
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath));
            await service.initialize();
            assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
            assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
            assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
            // 3) backup workspace path exists with empty folders within
            fs.mkdirSync(service.toBackupPath(fooFile));
            fs.mkdirSync(service.toBackupPath(barFile));
            fs.mkdirSync(path.$9d(service.toBackupPath(fooFile), network_1.Schemas.file));
            fs.mkdirSync(path.$9d(service.toBackupPath(barFile), network_1.Schemas.untitled));
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath));
            await service.initialize();
            assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
            assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
            assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
            // 4) backup workspace path points to a workspace that no longer exists
            // so it should convert the backup worspace to an empty workspace backup
            const fileBackups = path.$9d(service.toBackupPath(fooFile), network_1.Schemas.file);
            fs.mkdirSync(service.toBackupPath(fooFile));
            fs.mkdirSync(service.toBackupPath(barFile));
            fs.mkdirSync(fileBackups);
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
            assert.strictEqual(service.testGetWorkspaceBackups().length, 1);
            assert.strictEqual(service.getEmptyWindowBackups().length, 0);
            fs.writeFileSync(path.$9d(fileBackups, 'backup.txt'), '');
            await service.initialize();
            assert.strictEqual(service.testGetWorkspaceBackups().length, 0);
            assert.strictEqual(service.getEmptyWindowBackups().length, 1);
        });
        test('service supports to migrate backup data from another location', async () => {
            const backupPathToMigrate = service.toBackupPath(fooFile);
            fs.mkdirSync(backupPathToMigrate);
            fs.writeFileSync(path.$9d(backupPathToMigrate, 'backup.txt'), 'Some Data');
            service.registerFolderBackup(toFolderBackupInfo(uri_1.URI.file(backupPathToMigrate)));
            const workspaceBackupPath = await service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath), backupPathToMigrate);
            assert.ok(fs.existsSync(workspaceBackupPath));
            assert.ok(fs.existsSync(path.$9d(workspaceBackupPath, 'backup.txt')));
            assert.ok(!fs.existsSync(backupPathToMigrate));
            const emptyBackups = service.getEmptyWindowBackups();
            assert.strictEqual(0, emptyBackups.length);
        });
        test('service backup migration makes sure to preserve existing backups', async () => {
            const backupPathToMigrate = service.toBackupPath(fooFile);
            fs.mkdirSync(backupPathToMigrate);
            fs.writeFileSync(path.$9d(backupPathToMigrate, 'backup.txt'), 'Some Data');
            service.registerFolderBackup(toFolderBackupInfo(uri_1.URI.file(backupPathToMigrate)));
            const backupPathToPreserve = service.toBackupPath(barFile);
            fs.mkdirSync(backupPathToPreserve);
            fs.writeFileSync(path.$9d(backupPathToPreserve, 'backup.txt'), 'Some Data');
            service.registerFolderBackup(toFolderBackupInfo(uri_1.URI.file(backupPathToPreserve)));
            const workspaceBackupPath = await service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath), backupPathToMigrate);
            assert.ok(fs.existsSync(workspaceBackupPath));
            assert.ok(fs.existsSync(path.$9d(workspaceBackupPath, 'backup.txt')));
            assert.ok(!fs.existsSync(backupPathToMigrate));
            const emptyBackups = service.getEmptyWindowBackups();
            assert.strictEqual(1, emptyBackups.length);
            assert.strictEqual(1, fs.readdirSync(path.$9d(backupHome, emptyBackups[0].backupFolder)).length);
        });
        suite('loadSync', () => {
            test('getFolderBackupPaths() should return [] when workspaces.json doesn\'t exist', () => {
                assertEqualFolderInfos(service.testGetFolderBackups(), []);
            });
            test('getFolderBackupPaths() should return [] when folders in workspaces.json is absent', async () => {
                writeWorkspacesMetadata('{}');
                await service.initialize();
                assertEqualFolderInfos(service.testGetFolderBackups(), []);
            });
            test('getFolderBackupPaths() should return [] when folders in workspaces.json is not a string array', async () => {
                writeWorkspacesMetadata('{"folders":{}}');
                await service.initialize();
                assertEqualFolderInfos(service.testGetFolderBackups(), []);
                writeWorkspacesMetadata('{"folders":{"foo": ["bar"]}}');
                await service.initialize();
                assertEqualFolderInfos(service.testGetFolderBackups(), []);
                writeWorkspacesMetadata('{"folders":{"foo": []}}');
                await service.initialize();
                assertEqualFolderInfos(service.testGetFolderBackups(), []);
                writeWorkspacesMetadata('{"folders":{"foo": "bar"}}');
                await service.initialize();
                assertEqualFolderInfos(service.testGetFolderBackups(), []);
                writeWorkspacesMetadata('{"folders":"foo"}');
                await service.initialize();
                assertEqualFolderInfos(service.testGetFolderBackups(), []);
                writeWorkspacesMetadata('{"folders":1}');
                await service.initialize();
                assertEqualFolderInfos(service.testGetFolderBackups(), []);
            });
            test('getFolderBackupPaths() should return [] when files.hotExit = "onExitAndWindowClose"', async () => {
                const fi = toFolderBackupInfo(uri_1.URI.file(fooFile.fsPath.toUpperCase()));
                service.registerFolderBackup(fi);
                assertEqualFolderInfos(service.testGetFolderBackups(), [fi]);
                configService.setUserConfiguration('files.hotExit', files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE);
                await service.initialize();
                assertEqualFolderInfos(service.testGetFolderBackups(), []);
            });
            test('getWorkspaceBackups() should return [] when workspaces.json doesn\'t exist', () => {
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
            });
            test('getWorkspaceBackups() should return [] when folderWorkspaces in workspaces.json is absent', async () => {
                writeWorkspacesMetadata('{}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
            });
            test('getWorkspaceBackups() should return [] when rootWorkspaces in workspaces.json is not a object array', async () => {
                writeWorkspacesMetadata('{"rootWorkspaces":{}}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"rootWorkspaces":{"foo": ["bar"]}}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"rootWorkspaces":{"foo": []}}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"rootWorkspaces":{"foo": "bar"}}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"rootWorkspaces":"foo"}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"rootWorkspaces":1}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
            });
            test('getWorkspaceBackups() should return [] when workspaces in workspaces.json is not a object array', async () => {
                writeWorkspacesMetadata('{"workspaces":{}}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"workspaces":{"foo": ["bar"]}}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"workspaces":{"foo": []}}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"workspaces":{"foo": "bar"}}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"workspaces":"foo"}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
                writeWorkspacesMetadata('{"workspaces":1}');
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
            });
            test('getWorkspaceBackups() should return [] when files.hotExit = "onExitAndWindowClose"', async () => {
                const upperFooPath = fooFile.fsPath.toUpperCase();
                service.registerWorkspaceBackup(toWorkspaceBackupInfo(upperFooPath));
                assert.strictEqual(service.testGetWorkspaceBackups().length, 1);
                assert.deepStrictEqual(service.testGetWorkspaceBackups().map(r => r.workspace.configPath.toString()), [uri_1.URI.file(upperFooPath).toString()]);
                configService.setUserConfiguration('files.hotExit', files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE);
                await service.initialize();
                assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
            });
            test('getEmptyWorkspaceBackupPaths() should return [] when workspaces.json doesn\'t exist', () => {
                assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
            });
            test('getEmptyWorkspaceBackupPaths() should return [] when folderWorkspaces in workspaces.json is absent', async () => {
                writeWorkspacesMetadata('{}');
                await service.initialize();
                assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
            });
            test('getEmptyWorkspaceBackupPaths() should return [] when folderWorkspaces in workspaces.json is not a string array', async function () {
                writeWorkspacesMetadata('{"emptyWorkspaces":{}}');
                await service.initialize();
                assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
                writeWorkspacesMetadata('{"emptyWorkspaces":{"foo": ["bar"]}}');
                await service.initialize();
                assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
                writeWorkspacesMetadata('{"emptyWorkspaces":{"foo": []}}');
                await service.initialize();
                assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
                writeWorkspacesMetadata('{"emptyWorkspaces":{"foo": "bar"}}');
                await service.initialize();
                assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
                writeWorkspacesMetadata('{"emptyWorkspaces":"foo"}');
                await service.initialize();
                assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
                writeWorkspacesMetadata('{"emptyWorkspaces":1}');
                await service.initialize();
                assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
            });
        });
        suite('dedupeFolderWorkspaces', () => {
            test('should ignore duplicates (folder workspace)', async () => {
                await ensureFolderExists(existingTestFolder1);
                const workspacesJson = {
                    workspaces: [],
                    folders: [{ folderUri: existingTestFolder1.toString() }, { folderUri: existingTestFolder1.toString() }],
                    emptyWindows: []
                };
                writeWorkspacesMetadata(JSON.stringify(workspacesJson));
                await service.initialize();
                const json = readWorkspacesMetadata();
                assert.deepStrictEqual(json.folders, [{ folderUri: existingTestFolder1.toString() }]);
            });
            test('should ignore duplicates on Windows and Mac (folder workspace)', async () => {
                await ensureFolderExists(existingTestFolder1);
                const workspacesJson = {
                    workspaces: [],
                    folders: [{ folderUri: existingTestFolder1.toString() }, { folderUri: existingTestFolder1.toString().toLowerCase() }],
                    emptyWindows: []
                };
                writeWorkspacesMetadata(JSON.stringify(workspacesJson));
                await service.initialize();
                const json = readWorkspacesMetadata();
                assert.deepStrictEqual(json.folders, [{ folderUri: existingTestFolder1.toString() }]);
            });
            test('should ignore duplicates on Windows and Mac (root workspace)', async () => {
                const workspacePath = path.$9d(testDir, 'Foo.code-workspace');
                const workspacePath1 = path.$9d(testDir, 'FOO.code-workspace');
                const workspacePath2 = path.$9d(testDir, 'foo.code-workspace');
                const workspace1 = await ensureWorkspaceExists(toWorkspace(workspacePath));
                const workspace2 = await ensureWorkspaceExists(toWorkspace(workspacePath1));
                const workspace3 = await ensureWorkspaceExists(toWorkspace(workspacePath2));
                const workspacesJson = {
                    workspaces: [workspace1, workspace2, workspace3].map(toSerializedWorkspace),
                    folders: [],
                    emptyWindows: []
                };
                writeWorkspacesMetadata(JSON.stringify(workspacesJson));
                await service.initialize();
                const json = readWorkspacesMetadata();
                assert.strictEqual(json.workspaces.length, platform.$k ? 3 : 1);
                if (platform.$k) {
                    assert.deepStrictEqual(json.workspaces.map(r => r.configURIPath), [uri_1.URI.file(workspacePath).toString(), uri_1.URI.file(workspacePath1).toString(), uri_1.URI.file(workspacePath2).toString()]);
                }
                else {
                    assert.deepStrictEqual(json.workspaces.map(r => r.configURIPath), [uri_1.URI.file(workspacePath).toString()], 'should return the first duplicated entry');
                }
            });
        });
        suite('registerWindowForBackups', () => {
            test('should persist paths to workspaces.json (folder workspace)', async () => {
                service.registerFolderBackup(toFolderBackupInfo(fooFile));
                service.registerFolderBackup(toFolderBackupInfo(barFile));
                assertEqualFolderInfos(service.testGetFolderBackups(), [toFolderBackupInfo(fooFile), toFolderBackupInfo(barFile)]);
                const json = readWorkspacesMetadata();
                assert.deepStrictEqual(json.folders, [{ folderUri: fooFile.toString() }, { folderUri: barFile.toString() }]);
            });
            test('should persist paths to workspaces.json (root workspace)', async () => {
                const ws1 = toWorkspaceBackupInfo(fooFile.fsPath);
                service.registerWorkspaceBackup(ws1);
                const ws2 = toWorkspaceBackupInfo(barFile.fsPath);
                service.registerWorkspaceBackup(ws2);
                assert.deepStrictEqual(service.testGetWorkspaceBackups().map(b => b.workspace.configPath.toString()), [fooFile.toString(), barFile.toString()]);
                assert.strictEqual(ws1.workspace.id, service.testGetWorkspaceBackups()[0].workspace.id);
                assert.strictEqual(ws2.workspace.id, service.testGetWorkspaceBackups()[1].workspace.id);
                const json = readWorkspacesMetadata();
                assert.deepStrictEqual(json.workspaces.map(b => b.configURIPath), [fooFile.toString(), barFile.toString()]);
                assert.strictEqual(ws1.workspace.id, json.workspaces[0].id);
                assert.strictEqual(ws2.workspace.id, json.workspaces[1].id);
            });
        });
        test('should always store the workspace path in workspaces.json using the case given, regardless of whether the file system is case-sensitive (folder workspace)', async () => {
            service.registerFolderBackup(toFolderBackupInfo(uri_1.URI.file(fooFile.fsPath.toUpperCase())));
            assertEqualFolderInfos(service.testGetFolderBackups(), [toFolderBackupInfo(uri_1.URI.file(fooFile.fsPath.toUpperCase()))]);
            const json = readWorkspacesMetadata();
            assert.deepStrictEqual(json.folders, [{ folderUri: uri_1.URI.file(fooFile.fsPath.toUpperCase()).toString() }]);
        });
        test('should always store the workspace path in workspaces.json using the case given, regardless of whether the file system is case-sensitive (root workspace)', async () => {
            const upperFooPath = fooFile.fsPath.toUpperCase();
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(upperFooPath));
            assert.deepStrictEqual(service.testGetWorkspaceBackups().map(b => b.workspace.configPath.toString()), [uri_1.URI.file(upperFooPath).toString()]);
            const json = readWorkspacesMetadata();
            assert.deepStrictEqual(json.workspaces.map(b => b.configURIPath), [uri_1.URI.file(upperFooPath).toString()]);
        });
        suite('getWorkspaceHash', () => {
            (platform.$k ? test.skip : test)('should ignore case on Windows and Mac', () => {
                const assertFolderHash = (uri1, uri2) => {
                    assert.strictEqual(service.testGetFolderHash(toFolderBackupInfo(uri1)), service.testGetFolderHash(toFolderBackupInfo(uri2)));
                };
                if (platform.$j) {
                    assertFolderHash(uri_1.URI.file('/foo'), uri_1.URI.file('/FOO'));
                }
                if (platform.$i) {
                    assertFolderHash(uri_1.URI.file('c:\\foo'), uri_1.URI.file('C:\\FOO'));
                }
            });
        });
        suite('mixed path casing', () => {
            test('should handle case insensitive paths properly (registerWindowForBackupsSync) (folder workspace)', () => {
                service.registerFolderBackup(toFolderBackupInfo(fooFile));
                service.registerFolderBackup(toFolderBackupInfo(uri_1.URI.file(fooFile.fsPath.toUpperCase())));
                if (platform.$k) {
                    assert.strictEqual(service.testGetFolderBackups().length, 2);
                }
                else {
                    assert.strictEqual(service.testGetFolderBackups().length, 1);
                }
            });
            test('should handle case insensitive paths properly (registerWindowForBackupsSync) (root workspace)', () => {
                service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
                service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath.toUpperCase()));
                if (platform.$k) {
                    assert.strictEqual(service.testGetWorkspaceBackups().length, 2);
                }
                else {
                    assert.strictEqual(service.testGetWorkspaceBackups().length, 1);
                }
            });
        });
        suite('getDirtyWorkspaces', () => {
            test('should report if a workspace or folder has backups', async () => {
                const folderBackupPath = service.registerFolderBackup(toFolderBackupInfo(fooFile));
                const backupWorkspaceInfo = toWorkspaceBackupInfo(fooFile.fsPath);
                const workspaceBackupPath = service.registerWorkspaceBackup(backupWorkspaceInfo);
                assert.strictEqual(((await service.getDirtyWorkspaces()).length), 0);
                try {
                    await pfs_1.Promises.mkdir(path.$9d(folderBackupPath, network_1.Schemas.file), { recursive: true });
                    await pfs_1.Promises.mkdir(path.$9d(workspaceBackupPath, network_1.Schemas.untitled), { recursive: true });
                }
                catch (error) {
                    // ignore - folder might exist already
                }
                assert.strictEqual(((await service.getDirtyWorkspaces()).length), 0);
                fs.writeFileSync(path.$9d(folderBackupPath, network_1.Schemas.file, '594a4a9d82a277a899d4713a5b08f504'), '');
                fs.writeFileSync(path.$9d(workspaceBackupPath, network_1.Schemas.untitled, '594a4a9d82a277a899d4713a5b08f504'), '');
                const dirtyWorkspaces = await service.getDirtyWorkspaces();
                assert.strictEqual(dirtyWorkspaces.length, 2);
                let found = 0;
                for (const dirtyWorkpspace of dirtyWorkspaces) {
                    if ((0, backup_1.$dU)(dirtyWorkpspace)) {
                        if ((0, resources_1.$bg)(fooFile, dirtyWorkpspace.folderUri)) {
                            found++;
                        }
                    }
                    else {
                        if ((0, resources_1.$bg)(backupWorkspaceInfo.workspace.configPath, dirtyWorkpspace.workspace.configPath)) {
                            found++;
                        }
                    }
                }
                assert.strictEqual(found, 2);
            });
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=backupMainService.test.js.map