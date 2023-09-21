/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/arrays", "vs/base/common/hash", "vs/base/common/resources", "vs/base/common/path", "vs/base/common/uri", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/editor/test/common/testTextModel", "vs/base/common/network", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupService", "vs/platform/userData/common/fileUserDataProvider", "vs/base/common/buffer", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/cancellation", "vs/base/common/stream", "vs/workbench/test/common/workbenchTestServices", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/uuid", "vs/platform/product/common/product", "vs/base/test/common/utils", "vs/base/common/lifecycle", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentityService"], function (require, exports, assert, platform_1, arrays_1, hash_1, resources_1, path_1, uri_1, workingCopyBackupService_1, testTextModel_1, network_1, fileService_1, log_1, environmentService_1, textfiles_1, workingCopyBackupService_2, fileUserDataProvider_1, buffer_1, workbenchTestServices_1, cancellation_1, stream_1, workbenchTestServices_2, inMemoryFilesystemProvider_1, uuid_1, product_1, utils_1, lifecycle_1, userDataProfile_1, uriIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeTestWorkingCopyBackupService = exports.TestNativeWorkbenchEnvironmentService = void 0;
    const homeDir = uri_1.URI.file('home').with({ scheme: network_1.Schemas.inMemory });
    const tmpDir = uri_1.URI.file('tmp').with({ scheme: network_1.Schemas.inMemory });
    const NULL_PROFILE = {
        name: '',
        id: '',
        shortName: '',
        isDefault: false,
        location: homeDir,
        settingsResource: (0, resources_1.joinPath)(homeDir, 'settings.json'),
        globalStorageHome: (0, resources_1.joinPath)(homeDir, 'globalStorage'),
        keybindingsResource: (0, resources_1.joinPath)(homeDir, 'keybindings.json'),
        tasksResource: (0, resources_1.joinPath)(homeDir, 'tasks.json'),
        snippetsHome: (0, resources_1.joinPath)(homeDir, 'snippets'),
        extensionsResource: (0, resources_1.joinPath)(homeDir, 'extensions.json'),
        cacheHome: (0, resources_1.joinPath)(homeDir, 'cache')
    };
    const TestNativeWindowConfiguration = {
        windowId: 0,
        machineId: 'testMachineId',
        logLevel: log_1.LogLevel.Error,
        loggers: { global: [], window: [] },
        mainPid: 0,
        appRoot: '',
        userEnv: {},
        execPath: process.execPath,
        perfMarks: [],
        colorScheme: { dark: true, highContrast: false },
        os: { release: 'unknown', hostname: 'unknown', arch: 'unknown' },
        product: product_1.default,
        homeDir: homeDir.fsPath,
        tmpDir: tmpDir.fsPath,
        userDataDir: (0, resources_1.joinPath)(homeDir, product_1.default.nameShort).fsPath,
        profiles: { profile: NULL_PROFILE, all: [NULL_PROFILE], home: homeDir },
        _: []
    };
    class TestNativeWorkbenchEnvironmentService extends environmentService_1.NativeWorkbenchEnvironmentService {
        constructor(testDir, backupPath) {
            super({ ...TestNativeWindowConfiguration, backupPath: backupPath.fsPath, 'user-data-dir': testDir.fsPath }, workbenchTestServices_2.TestProductService);
        }
    }
    exports.TestNativeWorkbenchEnvironmentService = TestNativeWorkbenchEnvironmentService;
    class NodeTestWorkingCopyBackupService extends workingCopyBackupService_2.NativeWorkingCopyBackupService {
        constructor(testDir, workspaceBackupPath) {
            const environmentService = new TestNativeWorkbenchEnvironmentService(testDir, workspaceBackupPath);
            const logService = new log_1.NullLogService();
            const fileService = new fileService_1.FileService(logService);
            const lifecycleService = new workbenchTestServices_1.TestLifecycleService();
            super(environmentService, fileService, logService, lifecycleService);
            const fsp = new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider();
            fileService.registerProvider(network_1.Schemas.inMemory, fsp);
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            const userDataProfilesService = new userDataProfile_1.UserDataProfilesService(environmentService, fileService, uriIdentityService, logService);
            fileService.registerProvider(network_1.Schemas.vscodeUserData, new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, fsp, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
            this._fileService = fileService;
            this.backupResourceJoiners = [];
            this.discardBackupJoiners = [];
            this.discardedBackups = [];
            this.pendingBackupsArr = [];
            this.discardedAllBackups = false;
        }
        testGetFileService() {
            return this.fileService;
        }
        async waitForAllBackups() {
            await Promise.all(this.pendingBackupsArr);
        }
        joinBackupResource() {
            return new Promise(resolve => this.backupResourceJoiners.push(resolve));
        }
        async backup(identifier, content, versionId, meta, token) {
            const p = super.backup(identifier, content, versionId, meta, token);
            const removeFromPendingBackups = (0, arrays_1.insert)(this.pendingBackupsArr, p.then(undefined, undefined));
            try {
                await p;
            }
            finally {
                removeFromPendingBackups();
            }
            while (this.backupResourceJoiners.length) {
                this.backupResourceJoiners.pop()();
            }
        }
        joinDiscardBackup() {
            return new Promise(resolve => this.discardBackupJoiners.push(resolve));
        }
        async discardBackup(identifier) {
            await super.discardBackup(identifier);
            this.discardedBackups.push(identifier);
            while (this.discardBackupJoiners.length) {
                this.discardBackupJoiners.pop()();
            }
        }
        async discardBackups(filter) {
            this.discardedAllBackups = true;
            return super.discardBackups(filter);
        }
        async getBackupContents(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const fileContents = await this.fileService.readFile(backupResource);
            return fileContents.value.toString();
        }
    }
    exports.NodeTestWorkingCopyBackupService = NodeTestWorkingCopyBackupService;
    suite('WorkingCopyBackupService', () => {
        let testDir;
        let backupHome;
        let workspacesJsonPath;
        let workspaceBackupPath;
        let service;
        let fileService;
        const disposables = new lifecycle_1.DisposableStore();
        const workspaceResource = uri_1.URI.file(platform_1.isWindows ? 'c:\\workspace' : '/workspace');
        const fooFile = uri_1.URI.file(platform_1.isWindows ? 'c:\\Foo' : '/Foo');
        const customFile = uri_1.URI.parse('customScheme://some/path');
        const customFileWithFragment = uri_1.URI.parse('customScheme2://some/path#fragment');
        const barFile = uri_1.URI.file(platform_1.isWindows ? 'c:\\Bar' : '/Bar');
        const fooBarFile = uri_1.URI.file(platform_1.isWindows ? 'c:\\Foo Bar' : '/Foo Bar');
        const untitledFile = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
        setup(async () => {
            testDir = uri_1.URI.file((0, path_1.join)((0, uuid_1.generateUuid)(), 'vsctests', 'workingcopybackupservice')).with({ scheme: network_1.Schemas.inMemory });
            backupHome = (0, resources_1.joinPath)(testDir, 'Backups');
            workspacesJsonPath = (0, resources_1.joinPath)(backupHome, 'workspaces.json');
            workspaceBackupPath = (0, resources_1.joinPath)(backupHome, (0, hash_1.hash)(workspaceResource.fsPath).toString(16));
            service = disposables.add(new NodeTestWorkingCopyBackupService(testDir, workspaceBackupPath));
            fileService = service._fileService;
            await fileService.createFolder(backupHome);
            return fileService.writeFile(workspacesJsonPath, buffer_1.VSBuffer.fromString(''));
        });
        teardown(() => {
            disposables.clear();
        });
        suite('hashIdentifier', () => {
            test('should correctly hash the identifier for untitled scheme URIs', () => {
                const uri = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // If these hashes change people will lose their backed up files
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                const untypedBackupHash = (0, workingCopyBackupService_1.hashIdentifier)((0, workbenchTestServices_1.toUntypedWorkingCopyId)(uri));
                assert.strictEqual(untypedBackupHash, '-7f9c1a2e');
                assert.strictEqual(untypedBackupHash, (0, hash_1.hash)(uri.fsPath).toString(16));
                const typedBackupHash = (0, workingCopyBackupService_1.hashIdentifier)({ typeId: 'hashTest', resource: uri });
                if (platform_1.isWindows) {
                    assert.strictEqual(typedBackupHash, '-17c47cdc');
                }
                else {
                    assert.strictEqual(typedBackupHash, '-8ad5f4f');
                }
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // If these hashes collide people will lose their backed up files
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                assert.notStrictEqual(untypedBackupHash, typedBackupHash);
            });
            test('should correctly hash the identifier for file scheme URIs', () => {
                const uri = uri_1.URI.file('/foo');
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // If these hashes change people will lose their backed up files
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                const untypedBackupHash = (0, workingCopyBackupService_1.hashIdentifier)((0, workbenchTestServices_1.toUntypedWorkingCopyId)(uri));
                if (platform_1.isWindows) {
                    assert.strictEqual(untypedBackupHash, '20ffaa13');
                }
                else {
                    assert.strictEqual(untypedBackupHash, '20eb3560');
                }
                assert.strictEqual(untypedBackupHash, (0, hash_1.hash)(uri.fsPath).toString(16));
                const typedBackupHash = (0, workingCopyBackupService_1.hashIdentifier)({ typeId: 'hashTest', resource: uri });
                if (platform_1.isWindows) {
                    assert.strictEqual(typedBackupHash, '-55fc55db');
                }
                else {
                    assert.strictEqual(typedBackupHash, '51e56bf');
                }
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // If these hashes collide people will lose their backed up files
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                assert.notStrictEqual(untypedBackupHash, typedBackupHash);
            });
            test('should correctly hash the identifier for custom scheme URIs', () => {
                const uri = uri_1.URI.from({
                    scheme: 'vscode-custom',
                    path: 'somePath'
                });
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // If these hashes change people will lose their backed up files
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                const untypedBackupHash = (0, workingCopyBackupService_1.hashIdentifier)((0, workbenchTestServices_1.toUntypedWorkingCopyId)(uri));
                assert.strictEqual(untypedBackupHash, '-44972d98');
                assert.strictEqual(untypedBackupHash, (0, hash_1.hash)(uri.toString()).toString(16));
                const typedBackupHash = (0, workingCopyBackupService_1.hashIdentifier)({ typeId: 'hashTest', resource: uri });
                assert.strictEqual(typedBackupHash, '502149c7');
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // If these hashes collide people will lose their backed up files
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                assert.notStrictEqual(untypedBackupHash, typedBackupHash);
            });
            test('should not fail for URIs without path', () => {
                const uri = uri_1.URI.from({
                    scheme: 'vscode-fragment',
                    fragment: 'frag'
                });
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // If these hashes change people will lose their backed up files
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                const untypedBackupHash = (0, workingCopyBackupService_1.hashIdentifier)((0, workbenchTestServices_1.toUntypedWorkingCopyId)(uri));
                assert.strictEqual(untypedBackupHash, '-2f6b2f1b');
                assert.strictEqual(untypedBackupHash, (0, hash_1.hash)(uri.toString()).toString(16));
                const typedBackupHash = (0, workingCopyBackupService_1.hashIdentifier)({ typeId: 'hashTest', resource: uri });
                assert.strictEqual(typedBackupHash, '6e82ca57');
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // If these hashes collide people will lose their backed up files
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                assert.notStrictEqual(untypedBackupHash, typedBackupHash);
            });
        });
        suite('getBackupResource', () => {
            test('should get the correct backup path for text files', () => {
                // Format should be: <backupHome>/<workspaceHash>/<scheme>/<filePathHash>
                const backupResource = fooFile;
                const workspaceHash = (0, hash_1.hash)(workspaceResource.fsPath).toString(16);
                // No Type ID
                let backupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(backupResource);
                let filePathHash = (0, workingCopyBackupService_1.hashIdentifier)(backupId);
                let expectedPath = (0, resources_1.joinPath)(backupHome, workspaceHash, network_1.Schemas.file, filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
                // With Type ID
                backupId = (0, workbenchTestServices_1.toTypedWorkingCopyId)(backupResource);
                filePathHash = (0, workingCopyBackupService_1.hashIdentifier)(backupId);
                expectedPath = (0, resources_1.joinPath)(backupHome, workspaceHash, network_1.Schemas.file, filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
            });
            test('should get the correct backup path for untitled files', () => {
                // Format should be: <backupHome>/<workspaceHash>/<scheme>/<filePathHash>
                const backupResource = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
                const workspaceHash = (0, hash_1.hash)(workspaceResource.fsPath).toString(16);
                // No Type ID
                let backupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(backupResource);
                let filePathHash = (0, workingCopyBackupService_1.hashIdentifier)(backupId);
                let expectedPath = (0, resources_1.joinPath)(backupHome, workspaceHash, network_1.Schemas.untitled, filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
                // With Type ID
                backupId = (0, workbenchTestServices_1.toTypedWorkingCopyId)(backupResource);
                filePathHash = (0, workingCopyBackupService_1.hashIdentifier)(backupId);
                expectedPath = (0, resources_1.joinPath)(backupHome, workspaceHash, network_1.Schemas.untitled, filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
            });
            test('should get the correct backup path for custom files', () => {
                // Format should be: <backupHome>/<workspaceHash>/<scheme>/<filePathHash>
                const backupResource = uri_1.URI.from({ scheme: 'custom', path: 'custom/file.txt' });
                const workspaceHash = (0, hash_1.hash)(workspaceResource.fsPath).toString(16);
                // No Type ID
                let backupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(backupResource);
                let filePathHash = (0, workingCopyBackupService_1.hashIdentifier)(backupId);
                let expectedPath = (0, resources_1.joinPath)(backupHome, workspaceHash, 'custom', filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
                // With Type ID
                backupId = (0, workbenchTestServices_1.toTypedWorkingCopyId)(backupResource);
                filePathHash = (0, workingCopyBackupService_1.hashIdentifier)(backupId);
                expectedPath = (0, resources_1.joinPath)(backupHome, workspaceHash, 'custom', filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
            });
        });
        suite('backup', () => {
            function toExpectedPreamble(identifier, content = '', meta) {
                return `${identifier.resource.toString()} ${JSON.stringify({ ...meta, typeId: identifier.typeId })}\n${content}`;
            }
            test('joining', async () => {
                let backupJoined = false;
                const joinBackupsPromise = service.joinBackups();
                joinBackupsPromise.then(() => backupJoined = true);
                await joinBackupsPromise;
                assert.strictEqual(backupJoined, true);
                backupJoined = false;
                service.joinBackups().then(() => backupJoined = true);
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                const backupPromise = service.backup(identifier);
                assert.strictEqual(backupJoined, false);
                await backupPromise;
                assert.strictEqual(backupJoined, true);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('no text', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                await service.backup(identifier);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file (with version)', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')), 666);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                assert.ok(!service.hasBackupSync(identifier, 555));
                assert.ok(service.hasBackupSync(identifier, 666));
            });
            test('text file (with meta)', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                const meta = { etag: '678', orphaned: true };
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')), undefined, meta);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test', meta));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file with whitespace in name and type (with meta)', async () => {
                const fileWithSpace = uri_1.URI.file(platform_1.isWindows ? 'c:\\Foo \n Bar' : '/Foo \n Bar');
                const identifier = (0, workbenchTestServices_1.toTypedWorkingCopyId)(fileWithSpace, ' test id \n');
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                const meta = { etag: '678 \n k', orphaned: true };
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')), undefined, meta);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test', meta));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file with unicode character in name and type (with meta)', async () => {
                const fileWithUnicode = uri_1.URI.file(platform_1.isWindows ? 'c:\\so𒀅meࠄ' : '/so𒀅meࠄ');
                const identifier = (0, workbenchTestServices_1.toTypedWorkingCopyId)(fileWithUnicode, ' test so𒀅meࠄ id \n');
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                const meta = { etag: '678so𒀅meࠄ', orphaned: true };
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')), undefined, meta);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test', meta));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('untitled file', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file (readable)', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                const model = (0, testTextModel_1.createTextModel)('test');
                await service.backup(identifier, (0, textfiles_1.toBufferOrReadable)(model.createSnapshot()));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                assert.ok(service.hasBackupSync(identifier));
                model.dispose();
            });
            test('untitled file (readable)', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                const model = (0, testTextModel_1.createTextModel)('test');
                await service.backup(identifier, (0, textfiles_1.toBufferOrReadable)(model.createSnapshot()));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                model.dispose();
            });
            test('text file (large file, stream)', () => {
                const largeString = (new Array(30 * 1024)).join('Large String\n');
                return testLargeTextFile(largeString, (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString(largeString)));
            });
            test('text file (large file, readable)', async () => {
                const largeString = (new Array(30 * 1024)).join('Large String\n');
                const model = (0, testTextModel_1.createTextModel)(largeString);
                await testLargeTextFile(largeString, (0, textfiles_1.toBufferOrReadable)(model.createSnapshot()));
                model.dispose();
            });
            async function testLargeTextFile(largeString, buffer) {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                await service.backup(identifier, buffer, undefined, { largeTest: true });
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, largeString, { largeTest: true }));
                assert.ok(service.hasBackupSync(identifier));
            }
            test('untitled file (large file, readable)', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                const largeString = (new Array(30 * 1024)).join('Large String\n');
                const model = (0, testTextModel_1.createTextModel)(largeString);
                await service.backup(identifier, (0, textfiles_1.toBufferOrReadable)(model.createSnapshot()));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, largeString));
                assert.ok(service.hasBackupSync(identifier));
                model.dispose();
            });
            test('cancellation', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                const cts = new cancellation_1.CancellationTokenSource();
                const promise = service.backup(identifier, undefined, undefined, undefined, cts.token);
                cts.cancel();
                await promise;
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.ok(!service.hasBackupSync(identifier));
            });
            test('multiple', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                await Promise.all([
                    service.backup(identifier),
                    service.backup(identifier),
                    service.backup(identifier),
                    service.backup(identifier)
                ]);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('multiple same resource, different type id', async () => {
                const backupId1 = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupId2 = (0, workbenchTestServices_1.toTypedWorkingCopyId)(fooFile, 'type1');
                const backupId3 = (0, workbenchTestServices_1.toTypedWorkingCopyId)(fooFile, 'type2');
                await Promise.all([
                    service.backup(backupId1),
                    service.backup(backupId2),
                    service.backup(backupId3)
                ]);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 3);
                for (const backupId of [backupId1, backupId2, backupId3]) {
                    const fooBackupPath = (0, resources_1.joinPath)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(backupId));
                    assert.strictEqual((await fileService.exists(fooBackupPath)), true);
                    assert.strictEqual((await fileService.readFile(fooBackupPath)).value.toString(), toExpectedPreamble(backupId));
                    assert.ok(service.hasBackupSync(backupId));
                }
            });
        });
        suite('discardBackup', () => {
            test('joining', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.ok(service.hasBackupSync(identifier));
                let backupJoined = false;
                service.joinBackups().then(() => backupJoined = true);
                const discardBackupPromise = service.discardBackup(identifier);
                assert.strictEqual(backupJoined, false);
                await discardBackupPromise;
                assert.strictEqual(backupJoined, true);
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 0);
                assert.ok(!service.hasBackupSync(identifier));
            });
            test('text file', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.ok(service.hasBackupSync(identifier));
                await service.discardBackup(identifier);
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 0);
                assert.ok(!service.hasBackupSync(identifier));
            });
            test('untitled file', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                await service.discardBackup(identifier);
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'untitled'))).children?.length, 0);
            });
            test('multiple same resource, different type id', async () => {
                const backupId1 = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupId2 = (0, workbenchTestServices_1.toTypedWorkingCopyId)(fooFile, 'type1');
                const backupId3 = (0, workbenchTestServices_1.toTypedWorkingCopyId)(fooFile, 'type2');
                await Promise.all([
                    service.backup(backupId1),
                    service.backup(backupId2),
                    service.backup(backupId3)
                ]);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 3);
                for (const backupId of [backupId1, backupId2, backupId3]) {
                    const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(backupId));
                    await service.discardBackup(backupId);
                    assert.strictEqual((await fileService.exists(backupPath)), false);
                }
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 0);
            });
        });
        suite('discardBackups (all)', () => {
            test('text file', async () => {
                const backupId1 = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupId2 = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(barFile);
                const backupId3 = (0, workbenchTestServices_1.toTypedWorkingCopyId)(barFile);
                await service.backup(backupId1, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                await service.backup(backupId2, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 2);
                await service.backup(backupId3, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 3);
                await service.discardBackups();
                for (const backupId of [backupId1, backupId2, backupId3]) {
                    const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(backupId));
                    assert.strictEqual((await fileService.exists(backupPath)), false);
                }
                assert.strictEqual((await fileService.exists((0, resources_1.joinPath)(workspaceBackupPath, 'file'))), false);
            });
            test('untitled file', async () => {
                const backupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(backupId));
                await service.backup(backupId, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                await service.discardBackups();
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.strictEqual((await fileService.exists((0, resources_1.joinPath)(workspaceBackupPath, 'untitled'))), false);
            });
            test('can backup after discarding all', async () => {
                await service.discardBackups();
                await service.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.exists(workspaceBackupPath)), true);
            });
        });
        suite('discardBackups (except some)', () => {
            test('text file', async () => {
                const backupId1 = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const backupId2 = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(barFile);
                const backupId3 = (0, workbenchTestServices_1.toTypedWorkingCopyId)(barFile);
                await service.backup(backupId1, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 1);
                await service.backup(backupId2, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 2);
                await service.backup(backupId3, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'file'))).children?.length, 3);
                await service.discardBackups({ except: [backupId2, backupId3] });
                let backupPath = (0, resources_1.joinPath)(workspaceBackupPath, backupId1.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(backupId1));
                assert.strictEqual((await fileService.exists(backupPath)), false);
                backupPath = (0, resources_1.joinPath)(workspaceBackupPath, backupId2.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(backupId2));
                assert.strictEqual((await fileService.exists(backupPath)), true);
                backupPath = (0, resources_1.joinPath)(workspaceBackupPath, backupId3.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(backupId3));
                assert.strictEqual((await fileService.exists(backupPath)), true);
                await service.discardBackups({ except: [backupId1] });
                for (const backupId of [backupId1, backupId2, backupId3]) {
                    const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(backupId));
                    assert.strictEqual((await fileService.exists(backupPath)), false);
                }
            });
            test('untitled file', async () => {
                const backupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(backupId));
                await service.backup(backupId, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.resolve((0, resources_1.joinPath)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                await service.discardBackups({ except: [backupId] });
                assert.strictEqual((await fileService.exists(backupPath)), true);
            });
        });
        suite('getBackups', () => {
            test('text file', async () => {
                await Promise.all([
                    service.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test'))),
                    service.backup((0, workbenchTestServices_1.toTypedWorkingCopyId)(fooFile, 'type1'), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test'))),
                    service.backup((0, workbenchTestServices_1.toTypedWorkingCopyId)(fooFile, 'type2'), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')))
                ]);
                let backups = await service.getBackups();
                assert.strictEqual(backups.length, 3);
                for (const backup of backups) {
                    if (backup.typeId === '') {
                        assert.strictEqual(backup.resource.toString(), fooFile.toString());
                    }
                    else if (backup.typeId === 'type1') {
                        assert.strictEqual(backup.resource.toString(), fooFile.toString());
                    }
                    else if (backup.typeId === 'type2') {
                        assert.strictEqual(backup.resource.toString(), fooFile.toString());
                    }
                    else {
                        assert.fail('Unexpected backup');
                    }
                }
                await service.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(barFile), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')));
                backups = await service.getBackups();
                assert.strictEqual(backups.length, 4);
            });
            test('untitled file', async () => {
                await Promise.all([
                    service.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test'))),
                    service.backup((0, workbenchTestServices_1.toTypedWorkingCopyId)(untitledFile, 'type1'), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test'))),
                    service.backup((0, workbenchTestServices_1.toTypedWorkingCopyId)(untitledFile, 'type2'), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('test')))
                ]);
                const backups = await service.getBackups();
                assert.strictEqual(backups.length, 3);
                for (const backup of backups) {
                    if (backup.typeId === '') {
                        assert.strictEqual(backup.resource.toString(), untitledFile.toString());
                    }
                    else if (backup.typeId === 'type1') {
                        assert.strictEqual(backup.resource.toString(), untitledFile.toString());
                    }
                    else if (backup.typeId === 'type2') {
                        assert.strictEqual(backup.resource.toString(), untitledFile.toString());
                    }
                    else {
                        assert.fail('Unexpected backup');
                    }
                }
            });
        });
        suite('resolve', () => {
            test('should restore the original contents (untitled file)', async () => {
                const contents = 'test\nand more stuff';
                await testResolveBackup(untitledFile, contents);
            });
            test('should restore the original contents (untitled file with metadata)', async () => {
                const contents = 'test\nand more stuff';
                const meta = {
                    etag: 'the Etag',
                    size: 666,
                    mtime: Date.now(),
                    orphaned: true
                };
                await testResolveBackup(untitledFile, contents, meta);
            });
            test('should restore the original contents (untitled file empty with metadata)', async () => {
                const contents = '';
                const meta = {
                    etag: 'the Etag',
                    size: 666,
                    mtime: Date.now(),
                    orphaned: true
                };
                await testResolveBackup(untitledFile, contents, meta);
            });
            test('should restore the original contents (untitled large file with metadata)', async () => {
                const contents = (new Array(30 * 1024)).join('Large String\n');
                const meta = {
                    etag: 'the Etag',
                    size: 666,
                    mtime: Date.now(),
                    orphaned: true
                };
                await testResolveBackup(untitledFile, contents, meta);
            });
            test('should restore the original contents (text file)', async () => {
                const contents = [
                    'Lorem ipsum ',
                    'dolor öäü sit amet ',
                    'consectetur ',
                    'adipiscing ßß elit'
                ].join('');
                await testResolveBackup(fooFile, contents);
            });
            test('should restore the original contents (text file - custom scheme)', async () => {
                const contents = [
                    'Lorem ipsum ',
                    'dolor öäü sit amet ',
                    'consectetur ',
                    'adipiscing ßß elit'
                ].join('');
                await testResolveBackup(customFile, contents);
            });
            test('should restore the original contents (text file with metadata)', async () => {
                const contents = [
                    'Lorem ipsum ',
                    'dolor öäü sit amet ',
                    'adipiscing ßß elit',
                    'consectetur '
                ].join('');
                const meta = {
                    etag: 'theEtag',
                    size: 888,
                    mtime: Date.now(),
                    orphaned: false
                };
                await testResolveBackup(fooFile, contents, meta);
            });
            test('should restore the original contents (empty text file with metadata)', async () => {
                const contents = '';
                const meta = {
                    etag: 'theEtag',
                    size: 888,
                    mtime: Date.now(),
                    orphaned: false
                };
                await testResolveBackup(fooFile, contents, meta);
            });
            test('should restore the original contents (large text file with metadata)', async () => {
                const contents = (new Array(30 * 1024)).join('Large String\n');
                const meta = {
                    etag: 'theEtag',
                    size: 888,
                    mtime: Date.now(),
                    orphaned: false
                };
                await testResolveBackup(fooFile, contents, meta);
            });
            test('should restore the original contents (text file with metadata changed once)', async () => {
                const contents = [
                    'Lorem ipsum ',
                    'dolor öäü sit amet ',
                    'adipiscing ßß elit',
                    'consectetur '
                ].join('');
                const meta = {
                    etag: 'theEtag',
                    size: 888,
                    mtime: Date.now(),
                    orphaned: false
                };
                await testResolveBackup(fooFile, contents, meta);
                // Change meta and test again
                meta.size = 999;
                await testResolveBackup(fooFile, contents, meta);
            });
            test('should restore the original contents (text file with metadata and fragment URI)', async () => {
                const contents = [
                    'Lorem ipsum ',
                    'dolor öäü sit amet ',
                    'adipiscing ßß elit',
                    'consectetur '
                ].join('');
                const meta = {
                    etag: 'theEtag',
                    size: 888,
                    mtime: Date.now(),
                    orphaned: false
                };
                await testResolveBackup(customFileWithFragment, contents, meta);
            });
            test('should restore the original contents (text file with space in name with metadata)', async () => {
                const contents = [
                    'Lorem ipsum ',
                    'dolor öäü sit amet ',
                    'adipiscing ßß elit',
                    'consectetur '
                ].join('');
                const meta = {
                    etag: 'theEtag',
                    size: 888,
                    mtime: Date.now(),
                    orphaned: false
                };
                await testResolveBackup(fooBarFile, contents, meta);
            });
            test('should restore the original contents (text file with too large metadata to persist)', async () => {
                const contents = [
                    'Lorem ipsum ',
                    'dolor öäü sit amet ',
                    'adipiscing ßß elit',
                    'consectetur '
                ].join('');
                const meta = {
                    etag: (new Array(100 * 1024)).join('Large String'),
                    size: 888,
                    mtime: Date.now(),
                    orphaned: false
                };
                await testResolveBackup(fooFile, contents, meta, true);
            });
            async function testResolveBackup(resource, contents, meta, expectNoMeta) {
                await doTestResolveBackup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(resource), contents, meta, expectNoMeta);
                await doTestResolveBackup((0, workbenchTestServices_1.toTypedWorkingCopyId)(resource), contents, meta, expectNoMeta);
            }
            async function doTestResolveBackup(identifier, contents, meta, expectNoMeta) {
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString(contents)), 1, meta);
                const backup = await service.resolve(identifier);
                assert.ok(backup);
                assert.strictEqual(contents, (await (0, buffer_1.streamToBuffer)(backup.value)).toString());
                if (expectNoMeta || !meta) {
                    assert.strictEqual(backup.meta, undefined);
                }
                else {
                    assert.ok(backup.meta);
                    assert.strictEqual(backup.meta.etag, meta.etag);
                    assert.strictEqual(backup.meta.size, meta.size);
                    assert.strictEqual(backup.meta.mtime, meta.mtime);
                    assert.strictEqual(backup.meta.orphaned, meta.orphaned);
                    assert.strictEqual(Object.keys(meta).length, Object.keys(backup.meta).length);
                }
            }
            test('should restore the original contents (text file with broken metadata)', async () => {
                await testShouldRestoreOriginalContentsWithBrokenBackup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile));
                await testShouldRestoreOriginalContentsWithBrokenBackup((0, workbenchTestServices_1.toTypedWorkingCopyId)(fooFile));
            });
            async function testShouldRestoreOriginalContentsWithBrokenBackup(identifier) {
                const contents = [
                    'Lorem ipsum ',
                    'dolor öäü sit amet ',
                    'adipiscing ßß elit',
                    'consectetur '
                ].join('');
                const meta = {
                    etag: 'theEtag',
                    size: 888,
                    mtime: Date.now(),
                    orphaned: false
                };
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString(contents)), 1, meta);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                const fileContents = (await fileService.readFile(backupPath)).value.toString();
                assert.strictEqual(fileContents.indexOf(identifier.resource.toString()), 0);
                const metaIndex = fileContents.indexOf('{');
                const newFileContents = fileContents.substring(0, metaIndex) + '{{' + fileContents.substr(metaIndex);
                await fileService.writeFile(backupPath, buffer_1.VSBuffer.fromString(newFileContents));
                const backup = await service.resolve(identifier);
                assert.ok(backup);
                assert.strictEqual(contents, (await (0, buffer_1.streamToBuffer)(backup.value)).toString());
                assert.strictEqual(backup.meta, undefined);
            }
            test('should update metadata from file into model when resolving', async () => {
                await testShouldUpdateMetaFromFileWhenResolving((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile));
                await testShouldUpdateMetaFromFileWhenResolving((0, workbenchTestServices_1.toTypedWorkingCopyId)(fooFile));
            });
            async function testShouldUpdateMetaFromFileWhenResolving(identifier) {
                const contents = 'Foo Bar';
                const meta = {
                    etag: 'theEtagForThisMetadataTest',
                    size: 888,
                    mtime: Date.now(),
                    orphaned: false
                };
                const updatedMeta = {
                    ...meta,
                    etag: meta.etag + meta.etag
                };
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString(contents)), 1, meta);
                const backupPath = (0, resources_1.joinPath)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.hashIdentifier)(identifier));
                // Simulate the condition of the backups model loading initially without
                // meta data information and then getting the meta data updated on the
                // first call to resolve the backup. We simulate this by explicitly changing
                // the meta data in the file and then verifying that the updated meta data
                // is persisted back into the model (verified via `hasBackupSync`).
                // This is not really something that would happen in real life because any
                // backup that is made via backup service will update the model accordingly.
                const originalFileContents = (await fileService.readFile(backupPath)).value.toString();
                await fileService.writeFile(backupPath, buffer_1.VSBuffer.fromString(originalFileContents.replace(meta.etag, updatedMeta.etag)));
                await service.resolve(identifier);
                assert.strictEqual(service.hasBackupSync(identifier, undefined, meta), false);
                assert.strictEqual(service.hasBackupSync(identifier, undefined, updatedMeta), true);
                await fileService.writeFile(backupPath, buffer_1.VSBuffer.fromString(originalFileContents));
                await service.getBackups();
                assert.strictEqual(service.hasBackupSync(identifier, undefined, meta), true);
                assert.strictEqual(service.hasBackupSync(identifier, undefined, updatedMeta), false);
            }
            test('should ignore invalid backups (empty file)', async () => {
                const contents = 'test\nand more stuff';
                await service.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString(contents)), 1);
                let backup = await service.resolve((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile));
                assert.ok(backup);
                await service.testGetFileService().writeFile(service.toBackupResource((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile)), buffer_1.VSBuffer.fromString(''));
                backup = await service.resolve((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile));
                assert.ok(!backup);
            });
            test('should ignore invalid backups (no preamble)', async () => {
                const contents = 'testand more stuff';
                await service.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString(contents)), 1);
                let backup = await service.resolve((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile));
                assert.ok(backup);
                await service.testGetFileService().writeFile(service.toBackupResource((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile)), buffer_1.VSBuffer.fromString(contents));
                backup = await service.resolve((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile));
                assert.ok(!backup);
            });
            test('file with binary data', async () => {
                const identifier = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const buffer = Uint8Array.from([
                    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 73, 0, 0, 0, 67, 8, 2, 0, 0, 0, 95, 138, 191, 237, 0, 0, 0, 1, 115, 82, 71, 66, 0, 174, 206, 28, 233, 0, 0, 0, 4, 103, 65, 77, 65, 0, 0, 177, 143, 11, 252, 97, 5, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 14, 195, 0, 0, 14, 195, 1, 199, 111, 168, 100, 0, 0, 0, 71, 116, 69, 88, 116, 83, 111, 117, 114, 99, 101, 0, 83, 104, 111, 116, 116, 121, 32, 118, 50, 46, 48, 46, 50, 46, 50, 49, 54, 32, 40, 67, 41, 32, 84, 104, 111, 109, 97, 115, 32, 66, 97, 117, 109, 97, 110, 110, 32, 45, 32, 104, 116, 116, 112, 58, 47, 47, 115, 104, 111, 116, 116, 121, 46, 100, 101, 118, 115, 45, 111, 110, 46, 110, 101, 116, 44, 132, 21, 213, 0, 0, 0, 84, 73, 68, 65, 84, 120, 218, 237, 207, 65, 17, 0, 0, 12, 2, 32, 211, 217, 63, 146, 37, 246, 218, 65, 3, 210, 191, 226, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 118, 100, 169, 4, 173, 8, 44, 248, 184, 40, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
                ]);
                await service.backup(identifier, (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.wrap(buffer)), undefined, { binaryTest: 'true' });
                const backup = await service.resolve((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile));
                assert.ok(backup);
                const backupBuffer = await (0, stream_1.consumeStream)(backup.value, chunks => buffer_1.VSBuffer.concat(chunks));
                assert.strictEqual(backupBuffer.buffer.byteLength, buffer.byteLength);
            });
        });
        suite('WorkingCopyBackupsModel', () => {
            test('simple', async () => {
                const model = await workingCopyBackupService_1.WorkingCopyBackupsModel.create(workspaceBackupPath, service.testGetFileService());
                const resource1 = uri_1.URI.file('test.html');
                assert.strictEqual(model.has(resource1), false);
                model.add(resource1);
                assert.strictEqual(model.has(resource1), true);
                assert.strictEqual(model.has(resource1, 0), true);
                assert.strictEqual(model.has(resource1, 1), false);
                assert.strictEqual(model.has(resource1, 1, { foo: 'bar' }), false);
                model.remove(resource1);
                assert.strictEqual(model.has(resource1), false);
                model.add(resource1);
                assert.strictEqual(model.has(resource1), true);
                assert.strictEqual(model.has(resource1, 0), true);
                assert.strictEqual(model.has(resource1, 1), false);
                model.clear();
                assert.strictEqual(model.has(resource1), false);
                model.add(resource1, 1);
                assert.strictEqual(model.has(resource1), true);
                assert.strictEqual(model.has(resource1, 0), false);
                assert.strictEqual(model.has(resource1, 1), true);
                const resource2 = uri_1.URI.file('test1.html');
                const resource3 = uri_1.URI.file('test2.html');
                const resource4 = uri_1.URI.file('test3.html');
                model.add(resource2);
                model.add(resource3);
                model.add(resource4, undefined, { foo: 'bar' });
                assert.strictEqual(model.has(resource1), true);
                assert.strictEqual(model.has(resource2), true);
                assert.strictEqual(model.has(resource3), true);
                assert.strictEqual(model.has(resource4), true);
                assert.strictEqual(model.has(resource4, undefined, { foo: 'bar' }), true);
                assert.strictEqual(model.has(resource4, undefined, { bar: 'foo' }), false);
                model.update(resource4, { foo: 'nothing' });
                assert.strictEqual(model.has(resource4, undefined, { foo: 'nothing' }), true);
                assert.strictEqual(model.has(resource4, undefined, { foo: 'bar' }), false);
                model.update(resource4);
                assert.strictEqual(model.has(resource4), true);
                assert.strictEqual(model.has(resource4, undefined, { foo: 'nothing' }), false);
            });
            test('create', async () => {
                const fooBackupPath = (0, resources_1.joinPath)(workspaceBackupPath, fooFile.scheme, (0, workingCopyBackupService_1.hashIdentifier)((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile)));
                await fileService.createFolder((0, resources_1.dirname)(fooBackupPath));
                await fileService.writeFile(fooBackupPath, buffer_1.VSBuffer.fromString('foo'));
                const model = await workingCopyBackupService_1.WorkingCopyBackupsModel.create(workspaceBackupPath, service.testGetFileService());
                assert.strictEqual(model.has(fooBackupPath), true);
            });
            test('get', async () => {
                const model = await workingCopyBackupService_1.WorkingCopyBackupsModel.create(workspaceBackupPath, service.testGetFileService());
                assert.deepStrictEqual(model.get(), []);
                const file1 = uri_1.URI.file('/root/file/foo.html');
                const file2 = uri_1.URI.file('/root/file/bar.html');
                const untitled = uri_1.URI.file('/root/untitled/bar.html');
                model.add(file1);
                model.add(file2);
                model.add(untitled);
                assert.deepStrictEqual(model.get().map(f => f.fsPath), [file1.fsPath, file2.fsPath, untitled.fsPath]);
            });
        });
        suite('typeId migration', () => {
            test('works (when meta is missing)', async () => {
                const fooBackupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const untitledBackupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile);
                const customBackupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(customFile);
                const fooBackupPath = (0, resources_1.joinPath)(workspaceBackupPath, fooFile.scheme, (0, workingCopyBackupService_1.hashIdentifier)(fooBackupId));
                const untitledBackupPath = (0, resources_1.joinPath)(workspaceBackupPath, untitledFile.scheme, (0, workingCopyBackupService_1.hashIdentifier)(untitledBackupId));
                const customFileBackupPath = (0, resources_1.joinPath)(workspaceBackupPath, customFile.scheme, (0, workingCopyBackupService_1.hashIdentifier)(customBackupId));
                // Prepare backups of the old format without meta
                await fileService.createFolder((0, resources_1.joinPath)(workspaceBackupPath, fooFile.scheme));
                await fileService.createFolder((0, resources_1.joinPath)(workspaceBackupPath, untitledFile.scheme));
                await fileService.createFolder((0, resources_1.joinPath)(workspaceBackupPath, customFile.scheme));
                await fileService.writeFile(fooBackupPath, buffer_1.VSBuffer.fromString(`${fooFile.toString()}\ntest file`));
                await fileService.writeFile(untitledBackupPath, buffer_1.VSBuffer.fromString(`${untitledFile.toString()}\ntest untitled`));
                await fileService.writeFile(customFileBackupPath, buffer_1.VSBuffer.fromString(`${customFile.toString()}\ntest custom`));
                service.reinitialize(workspaceBackupPath);
                const backups = await service.getBackups();
                assert.strictEqual(backups.length, 3);
                assert.ok(backups.some(backup => (0, resources_1.isEqual)(backup.resource, fooFile)));
                assert.ok(backups.some(backup => (0, resources_1.isEqual)(backup.resource, untitledFile)));
                assert.ok(backups.some(backup => (0, resources_1.isEqual)(backup.resource, customFile)));
                assert.ok(backups.every(backup => backup.typeId === ''));
            });
            test('works (when typeId in meta is missing)', async () => {
                const fooBackupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile);
                const untitledBackupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile);
                const customBackupId = (0, workbenchTestServices_1.toUntypedWorkingCopyId)(customFile);
                const fooBackupPath = (0, resources_1.joinPath)(workspaceBackupPath, fooFile.scheme, (0, workingCopyBackupService_1.hashIdentifier)(fooBackupId));
                const untitledBackupPath = (0, resources_1.joinPath)(workspaceBackupPath, untitledFile.scheme, (0, workingCopyBackupService_1.hashIdentifier)(untitledBackupId));
                const customFileBackupPath = (0, resources_1.joinPath)(workspaceBackupPath, customFile.scheme, (0, workingCopyBackupService_1.hashIdentifier)(customBackupId));
                // Prepare backups of the old format without meta
                await fileService.createFolder((0, resources_1.joinPath)(workspaceBackupPath, fooFile.scheme));
                await fileService.createFolder((0, resources_1.joinPath)(workspaceBackupPath, untitledFile.scheme));
                await fileService.createFolder((0, resources_1.joinPath)(workspaceBackupPath, customFile.scheme));
                await fileService.writeFile(fooBackupPath, buffer_1.VSBuffer.fromString(`${fooFile.toString()} ${JSON.stringify({ foo: 'bar' })}\ntest file`));
                await fileService.writeFile(untitledBackupPath, buffer_1.VSBuffer.fromString(`${untitledFile.toString()} ${JSON.stringify({ foo: 'bar' })}\ntest untitled`));
                await fileService.writeFile(customFileBackupPath, buffer_1.VSBuffer.fromString(`${customFile.toString()} ${JSON.stringify({ foo: 'bar' })}\ntest custom`));
                service.reinitialize(workspaceBackupPath);
                const backups = await service.getBackups();
                assert.strictEqual(backups.length, 3);
                assert.ok(backups.some(backup => (0, resources_1.isEqual)(backup.resource, fooFile)));
                assert.ok(backups.some(backup => (0, resources_1.isEqual)(backup.resource, untitledFile)));
                assert.ok(backups.some(backup => (0, resources_1.isEqual)(backup.resource, customFile)));
                assert.ok(backups.every(backup => backup.typeId === ''));
            });
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBTZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvd29ya2luZ0NvcHkvdGVzdC9lbGVjdHJvbi1zYW5kYm94L3dvcmtpbmdDb3B5QmFja3VwU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtDaEcsTUFBTSxPQUFPLEdBQUcsU0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLE1BQU0sTUFBTSxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLGlCQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUNsRSxNQUFNLFlBQVksR0FBRztRQUNwQixJQUFJLEVBQUUsRUFBRTtRQUNSLEVBQUUsRUFBRSxFQUFFO1FBQ04sU0FBUyxFQUFFLEVBQUU7UUFDYixTQUFTLEVBQUUsS0FBSztRQUNoQixRQUFRLEVBQUUsT0FBTztRQUNqQixnQkFBZ0IsRUFBRSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQztRQUNwRCxpQkFBaUIsRUFBRSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQztRQUNyRCxtQkFBbUIsRUFBRSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDO1FBQzFELGFBQWEsRUFBRSxJQUFBLG9CQUFRLEVBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQztRQUM5QyxZQUFZLEVBQUUsSUFBQSxvQkFBUSxFQUFDLE9BQU8sRUFBRSxVQUFVLENBQUM7UUFDM0Msa0JBQWtCLEVBQUUsSUFBQSxvQkFBUSxFQUFDLE9BQU8s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LEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFF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QUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRTNFLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlFLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRTNFLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNoRixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3pCLE1BQU0sYUFBYSxHQUFHLElB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