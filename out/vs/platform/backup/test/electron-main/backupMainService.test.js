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
                fs.mkdirSync(path.join(backupFolder, network_1.Schemas.file));
                await pfs_1.Promises.writeFile(path.join(backupFolder, network_1.Schemas.file, 'foo.txt'), 'Hello');
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
            return platform.isLinux ? p : p.toLowerCase();
        }
        const fooFile = uri_1.URI.file(platform.isWindows ? 'C:\\foo' : '/foo');
        const barFile = uri_1.URI.file(platform.isWindows ? 'C:\\bar' : '/bar');
        let service;
        let configService;
        let stateMainService;
        let environmentService;
        let testDir;
        let backupHome;
        let existingTestFolder1;
        setup(async () => {
            testDir = (0, testUtils_1.getRandomTestPath)(os.tmpdir(), 'vsctests', 'backupmainservice');
            backupHome = path.join(testDir, 'Backups');
            existingTestFolder1 = uri_1.URI.file(path.join(testDir, 'folder1'));
            environmentService = new environmentMainService_1.EnvironmentMainService((0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS), { _serviceBrand: undefined, ...product_1.default });
            await pfs_1.Promises.mkdir(backupHome, { recursive: true });
            configService = new testConfigurationService_1.TestConfigurationService();
            stateMainService = new workbenchTestServices_1.InMemoryTestStateMainService();
            service = new class TestBackupMainService extends backupMainService_1.BackupMainService {
                constructor() {
                    super(environmentService, configService, new logService_1.LogService(new log_1.ConsoleMainLogger()), stateMainService);
                    this.backupHome = backupHome;
                }
                toBackupPath(arg) {
                    const id = arg instanceof uri_1.URI ? super.getFolderHash({ folderUri: arg }) : arg;
                    return path.join(this.backupHome, id);
                }
                testGetFolderHash(folder) {
                    return super.getFolderHash(folder);
                }
                testGetWorkspaceBackups() {
                    return super.getWorkspaceBackups();
                }
                testGetFolderBackups() {
                    return super.getFolderBackups();
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
            fs.mkdirSync(path.join(service.toBackupPath(fooFile), network_1.Schemas.file));
            fs.mkdirSync(path.join(service.toBackupPath(barFile), network_1.Schemas.untitled));
            service.registerFolderBackup(toFolderBackupInfo(fooFile));
            service.registerFolderBackup(toFolderBackupInfo(barFile));
            await service.initialize();
            assertEqualFolderInfos(service.testGetFolderBackups(), []);
            assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
            assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
            // 4) backup workspace path points to a workspace that no longer exists
            // so it should convert the backup worspace to an empty workspace backup
            const fileBackups = path.join(service.toBackupPath(fooFile), network_1.Schemas.file);
            fs.mkdirSync(service.toBackupPath(fooFile));
            fs.mkdirSync(service.toBackupPath(barFile));
            fs.mkdirSync(fileBackups);
            service.registerFolderBackup(toFolderBackupInfo(fooFile));
            assert.strictEqual(service.testGetFolderBackups().length, 1);
            assert.strictEqual(service.getEmptyWindowBackups().length, 0);
            fs.writeFileSync(path.join(fileBackups, 'backup.txt'), '');
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
            fs.mkdirSync(path.join(service.toBackupPath(fooFile), network_1.Schemas.file));
            fs.mkdirSync(path.join(service.toBackupPath(barFile), network_1.Schemas.untitled));
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath));
            await service.initialize();
            assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
            assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
            assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
            // 4) backup workspace path points to a workspace that no longer exists
            // so it should convert the backup worspace to an empty workspace backup
            const fileBackups = path.join(service.toBackupPath(fooFile), network_1.Schemas.file);
            fs.mkdirSync(service.toBackupPath(fooFile));
            fs.mkdirSync(service.toBackupPath(barFile));
            fs.mkdirSync(fileBackups);
            service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
            assert.strictEqual(service.testGetWorkspaceBackups().length, 1);
            assert.strictEqual(service.getEmptyWindowBackups().length, 0);
            fs.writeFileSync(path.join(fileBackups, 'backup.txt'), '');
            await service.initialize();
            assert.strictEqual(service.testGetWorkspaceBackups().length, 0);
            assert.strictEqual(service.getEmptyWindowBackups().length, 1);
        });
        test('service supports to migrate backup data from another location', async () => {
            const backupPathToMigrate = service.toBackupPath(fooFile);
            fs.mkdirSync(backupPathToMigrate);
            fs.writeFileSync(path.join(backupPathToMigrate, 'backup.txt'), 'Some Data');
            service.registerFolderBackup(toFolderBackupInfo(uri_1.URI.file(backupPathToMigrate)));
            const workspaceBackupPath = await service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath), backupPathToMigrate);
            assert.ok(fs.existsSync(workspaceBackupPath));
            assert.ok(fs.existsSync(path.join(workspaceBackupPath, 'backup.txt')));
            assert.ok(!fs.existsSync(backupPathToMigrate));
            const emptyBackups = service.getEmptyWindowBackups();
            assert.strictEqual(0, emptyBackups.length);
        });
        test('service backup migration makes sure to preserve existing backups', async () => {
            const backupPathToMigrate = service.toBackupPath(fooFile);
            fs.mkdirSync(backupPathToMigrate);
            fs.writeFileSync(path.join(backupPathToMigrate, 'backup.txt'), 'Some Data');
            service.registerFolderBackup(toFolderBackupInfo(uri_1.URI.file(backupPathToMigrate)));
            const backupPathToPreserve = service.toBackupPath(barFile);
            fs.mkdirSync(backupPathToPreserve);
            fs.writeFileSync(path.join(backupPathToPreserve, 'backup.txt'), 'Some Data');
            service.registerFolderBackup(toFolderBackupInfo(uri_1.URI.file(backupPathToPreserve)));
            const workspaceBackupPath = await service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath), backupPathToMigrate);
            assert.ok(fs.existsSync(workspaceBackupPath));
            assert.ok(fs.existsSync(path.join(workspaceBackupPath, 'backup.txt')));
            assert.ok(!fs.existsSync(backupPathToMigrate));
            const emptyBackups = service.getEmptyWindowBackups();
            assert.strictEqual(1, emptyBackups.length);
            assert.strictEqual(1, fs.readdirSync(path.join(backupHome, emptyBackups[0].backupFolder)).length);
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
                configService.setUserConfiguration('files.hotExit', files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE);
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
                configService.setUserConfiguration('files.hotExit', files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE);
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
                const workspacePath = path.join(testDir, 'Foo.code-workspace');
                const workspacePath1 = path.join(testDir, 'FOO.code-workspace');
                const workspacePath2 = path.join(testDir, 'foo.code-workspace');
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
                assert.strictEqual(json.workspaces.length, platform.isLinux ? 3 : 1);
                if (platform.isLinux) {
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
            (platform.isLinux ? test.skip : test)('should ignore case on Windows and Mac', () => {
                const assertFolderHash = (uri1, uri2) => {
                    assert.strictEqual(service.testGetFolderHash(toFolderBackupInfo(uri1)), service.testGetFolderHash(toFolderBackupInfo(uri2)));
                };
                if (platform.isMacintosh) {
                    assertFolderHash(uri_1.URI.file('/foo'), uri_1.URI.file('/FOO'));
                }
                if (platform.isWindows) {
                    assertFolderHash(uri_1.URI.file('c:\\foo'), uri_1.URI.file('C:\\FOO'));
                }
            });
        });
        suite('mixed path casing', () => {
            test('should handle case insensitive paths properly (registerWindowForBackupsSync) (folder workspace)', () => {
                service.registerFolderBackup(toFolderBackupInfo(fooFile));
                service.registerFolderBackup(toFolderBackupInfo(uri_1.URI.file(fooFile.fsPath.toUpperCase())));
                if (platform.isLinux) {
                    assert.strictEqual(service.testGetFolderBackups().length, 2);
                }
                else {
                    assert.strictEqual(service.testGetFolderBackups().length, 1);
                }
            });
            test('should handle case insensitive paths properly (registerWindowForBackupsSync) (root workspace)', () => {
                service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
                service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath.toUpperCase()));
                if (platform.isLinux) {
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
                    await pfs_1.Promises.mkdir(path.join(folderBackupPath, network_1.Schemas.file), { recursive: true });
                    await pfs_1.Promises.mkdir(path.join(workspaceBackupPath, network_1.Schemas.untitled), { recursive: true });
                }
                catch (error) {
                    // ignore - folder might exist already
                }
                assert.strictEqual(((await service.getDirtyWorkspaces()).length), 0);
                fs.writeFileSync(path.join(folderBackupPath, network_1.Schemas.file, '594a4a9d82a277a899d4713a5b08f504'), '');
                fs.writeFileSync(path.join(workspaceBackupPath, network_1.Schemas.untitled, '594a4a9d82a277a899d4713a5b08f504'), '');
                const dirtyWorkspaces = await service.getDirtyWorkspaces();
                assert.strictEqual(dirtyWorkspaces.length, 2);
                let found = 0;
                for (const dirtyWorkpspace of dirtyWorkspaces) {
                    if ((0, backup_1.isFolderBackupInfo)(dirtyWorkpspace)) {
                        if ((0, resources_1.isEqual)(fooFile, dirtyWorkpspace.folderUri)) {
                            found++;
                        }
                    }
                    else {
                        if ((0, resources_1.isEqual)(backupWorkspaceInfo.workspace.configPath, dirtyWorkpspace.workspace.configPath)) {
                            found++;
                        }
                    }
                }
                assert.strictEqual(found, 2);
            });
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja3VwTWFpblNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2JhY2t1cC90ZXN0L2VsZWN0cm9uLW1haW4vYmFja3VwTWFpblNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQTJCaEcsSUFBQSxzQkFBVSxFQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtRQUVwQyxTQUFTLHNCQUFzQixDQUFDLE1BQTJCLEVBQUUsUUFBNkI7WUFDekYsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQzlILE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUVELFNBQVMsV0FBVyxDQUFDLElBQVk7WUFDaEMsT0FBTztnQkFDTixFQUFFLEVBQUUsSUFBQSxtQkFBVSxFQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUM5RCxVQUFVLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDMUIsQ0FBQztRQUNILENBQUM7UUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQVksRUFBRSxlQUF3QjtZQUNwRSxPQUFPO2dCQUNOLFNBQVMsRUFBRTtvQkFDVixFQUFFLEVBQUUsSUFBQSxtQkFBVSxFQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxD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