/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/arrays", "vs/base/common/hash", "vs/base/common/resources", "vs/base/common/path", "vs/base/common/uri", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/editor/test/common/testTextModel", "vs/base/common/network", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupService", "vs/platform/userData/common/fileUserDataProvider", "vs/base/common/buffer", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/cancellation", "vs/base/common/stream", "vs/workbench/test/common/workbenchTestServices", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/uuid", "vs/platform/product/common/product", "vs/base/test/common/utils", "vs/base/common/lifecycle", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentityService"], function (require, exports, assert, platform_1, arrays_1, hash_1, resources_1, path_1, uri_1, workingCopyBackupService_1, testTextModel_1, network_1, fileService_1, log_1, environmentService_1, textfiles_1, workingCopyBackupService_2, fileUserDataProvider_1, buffer_1, workbenchTestServices_1, cancellation_1, stream_1, workbenchTestServices_2, inMemoryFilesystemProvider_1, uuid_1, product_1, utils_1, lifecycle_1, userDataProfile_1, uriIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ugc = exports.$tgc = void 0;
    const homeDir = uri_1.URI.file('home').with({ scheme: network_1.Schemas.inMemory });
    const tmpDir = uri_1.URI.file('tmp').with({ scheme: network_1.Schemas.inMemory });
    const NULL_PROFILE = {
        name: '',
        id: '',
        shortName: '',
        isDefault: false,
        location: homeDir,
        settingsResource: (0, resources_1.$ig)(homeDir, 'settings.json'),
        globalStorageHome: (0, resources_1.$ig)(homeDir, 'globalStorage'),
        keybindingsResource: (0, resources_1.$ig)(homeDir, 'keybindings.json'),
        tasksResource: (0, resources_1.$ig)(homeDir, 'tasks.json'),
        snippetsHome: (0, resources_1.$ig)(homeDir, 'snippets'),
        extensionsResource: (0, resources_1.$ig)(homeDir, 'extensions.json'),
        cacheHome: (0, resources_1.$ig)(homeDir, 'cache')
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
        userDataDir: (0, resources_1.$ig)(homeDir, product_1.default.nameShort).fsPath,
        profiles: { profile: NULL_PROFILE, all: [NULL_PROFILE], home: homeDir },
        _: []
    };
    class $tgc extends environmentService_1.$2$b {
        constructor(testDir, backupPath) {
            super({ ...TestNativeWindowConfiguration, backupPath: backupPath.fsPath, 'user-data-dir': testDir.fsPath }, workbenchTestServices_2.$bec);
        }
    }
    exports.$tgc = $tgc;
    class $ugc extends workingCopyBackupService_2.$5_b {
        constructor(testDir, workspaceBackupPath) {
            const environmentService = new $tgc(testDir, workspaceBackupPath);
            const logService = new log_1.$fj();
            const fileService = new fileService_1.$Dp(logService);
            const lifecycleService = new workbenchTestServices_1.$Kec();
            super(environmentService, fileService, logService, lifecycleService);
            const fsp = new inMemoryFilesystemProvider_1.$rAb();
            fileService.registerProvider(network_1.Schemas.inMemory, fsp);
            const uriIdentityService = new uriIdentityService_1.$pr(fileService);
            const userDataProfilesService = new userDataProfile_1.$Hk(environmentService, fileService, uriIdentityService, logService);
            fileService.registerProvider(network_1.Schemas.vscodeUserData, new fileUserDataProvider_1.$n7b(network_1.Schemas.file, fsp, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
            this._fileService = fileService;
            this.m = [];
            this.n = [];
            this.discardedBackups = [];
            this.r = [];
            this.discardedAllBackups = false;
        }
        testGetFileService() {
            return this.b;
        }
        async waitForAllBackups() {
            await Promise.all(this.r);
        }
        joinBackupResource() {
            return new Promise(resolve => this.m.push(resolve));
        }
        async backup(identifier, content, versionId, meta, token) {
            const p = super.backup(identifier, content, versionId, meta, token);
            const removeFromPendingBackups = (0, arrays_1.$Sb)(this.r, p.then(undefined, undefined));
            try {
                await p;
            }
            finally {
                removeFromPendingBackups();
            }
            while (this.m.length) {
                this.m.pop()();
            }
        }
        joinDiscardBackup() {
            return new Promise(resolve => this.n.push(resolve));
        }
        async discardBackup(identifier) {
            await super.discardBackup(identifier);
            this.discardedBackups.push(identifier);
            while (this.n.length) {
                this.n.pop()();
            }
        }
        async discardBackups(filter) {
            this.discardedAllBackups = true;
            return super.discardBackups(filter);
        }
        async getBackupContents(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const fileContents = await this.b.readFile(backupResource);
            return fileContents.value.toString();
        }
    }
    exports.$ugc = $ugc;
    suite('WorkingCopyBackupService', () => {
        let testDir;
        let backupHome;
        let workspacesJsonPath;
        let workspaceBackupPath;
        let service;
        let fileService;
        const disposables = new lifecycle_1.$jc();
        const workspaceResource = uri_1.URI.file(platform_1.$i ? 'c:\\workspace' : '/workspace');
        const fooFile = uri_1.URI.file(platform_1.$i ? 'c:\\Foo' : '/Foo');
        const customFile = uri_1.URI.parse('customScheme://some/path');
        const customFileWithFragment = uri_1.URI.parse('customScheme2://some/path#fragment');
        const barFile = uri_1.URI.file(platform_1.$i ? 'c:\\Bar' : '/Bar');
        const fooBarFile = uri_1.URI.file(platform_1.$i ? 'c:\\Foo Bar' : '/Foo Bar');
        const untitledFile = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
        setup(async () => {
            testDir = uri_1.URI.file((0, path_1.$9d)((0, uuid_1.$4f)(), 'vsctests', 'workingcopybackupservice')).with({ scheme: network_1.Schemas.inMemory });
            backupHome = (0, resources_1.$ig)(testDir, 'Backups');
            workspacesJsonPath = (0, resources_1.$ig)(backupHome, 'workspaces.json');
            workspaceBackupPath = (0, resources_1.$ig)(backupHome, (0, hash_1.$pi)(workspaceResource.fsPath).toString(16));
            service = disposables.add(new $ugc(testDir, workspaceBackupPath));
            fileService = service._fileService;
            await fileService.createFolder(backupHome);
            return fileService.writeFile(workspacesJsonPath, buffer_1.$Fd.fromString(''));
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
                const untypedBackupHash = (0, workingCopyBackupService_1.$j4b)((0, workbenchTestServices_1.$Hec)(uri));
                assert.strictEqual(untypedBackupHash, '-7f9c1a2e');
                assert.strictEqual(untypedBackupHash, (0, hash_1.$pi)(uri.fsPath).toString(16));
                const typedBackupHash = (0, workingCopyBackupService_1.$j4b)({ typeId: 'hashTest', resource: uri });
                if (platform_1.$i) {
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
                const untypedBackupHash = (0, workingCopyBackupService_1.$j4b)((0, workbenchTestServices_1.$Hec)(uri));
                if (platform_1.$i) {
                    assert.strictEqual(untypedBackupHash, '20ffaa13');
                }
                else {
                    assert.strictEqual(untypedBackupHash, '20eb3560');
                }
                assert.strictEqual(untypedBackupHash, (0, hash_1.$pi)(uri.fsPath).toString(16));
                const typedBackupHash = (0, workingCopyBackupService_1.$j4b)({ typeId: 'hashTest', resource: uri });
                if (platform_1.$i) {
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
                const untypedBackupHash = (0, workingCopyBackupService_1.$j4b)((0, workbenchTestServices_1.$Hec)(uri));
                assert.strictEqual(untypedBackupHash, '-44972d98');
                assert.strictEqual(untypedBackupHash, (0, hash_1.$pi)(uri.toString()).toString(16));
                const typedBackupHash = (0, workingCopyBackupService_1.$j4b)({ typeId: 'hashTest', resource: uri });
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
                const untypedBackupHash = (0, workingCopyBackupService_1.$j4b)((0, workbenchTestServices_1.$Hec)(uri));
                assert.strictEqual(untypedBackupHash, '-2f6b2f1b');
                assert.strictEqual(untypedBackupHash, (0, hash_1.$pi)(uri.toString()).toString(16));
                const typedBackupHash = (0, workingCopyBackupService_1.$j4b)({ typeId: 'hashTest', resource: uri });
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
                const workspaceHash = (0, hash_1.$pi)(workspaceResource.fsPath).toString(16);
                // No Type ID
                let backupId = (0, workbenchTestServices_1.$Hec)(backupResource);
                let filePathHash = (0, workingCopyBackupService_1.$j4b)(backupId);
                let expectedPath = (0, resources_1.$ig)(backupHome, workspaceHash, network_1.Schemas.file, filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
                // With Type ID
                backupId = (0, workbenchTestServices_1.$Iec)(backupResource);
                filePathHash = (0, workingCopyBackupService_1.$j4b)(backupId);
                expectedPath = (0, resources_1.$ig)(backupHome, workspaceHash, network_1.Schemas.file, filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
            });
            test('should get the correct backup path for untitled files', () => {
                // Format should be: <backupHome>/<workspaceHash>/<scheme>/<filePathHash>
                const backupResource = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
                const workspaceHash = (0, hash_1.$pi)(workspaceResource.fsPath).toString(16);
                // No Type ID
                let backupId = (0, workbenchTestServices_1.$Hec)(backupResource);
                let filePathHash = (0, workingCopyBackupService_1.$j4b)(backupId);
                let expectedPath = (0, resources_1.$ig)(backupHome, workspaceHash, network_1.Schemas.untitled, filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
                // With Type ID
                backupId = (0, workbenchTestServices_1.$Iec)(backupResource);
                filePathHash = (0, workingCopyBackupService_1.$j4b)(backupId);
                expectedPath = (0, resources_1.$ig)(backupHome, workspaceHash, network_1.Schemas.untitled, filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
            });
            test('should get the correct backup path for custom files', () => {
                // Format should be: <backupHome>/<workspaceHash>/<scheme>/<filePathHash>
                const backupResource = uri_1.URI.from({ scheme: 'custom', path: 'custom/file.txt' });
                const workspaceHash = (0, hash_1.$pi)(workspaceResource.fsPath).toString(16);
                // No Type ID
                let backupId = (0, workbenchTestServices_1.$Hec)(backupResource);
                let filePathHash = (0, workingCopyBackupService_1.$j4b)(backupId);
                let expectedPath = (0, resources_1.$ig)(backupHome, workspaceHash, 'custom', filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
                assert.strictEqual(service.toBackupResource(backupId).toString(), expectedPath);
                // With Type ID
                backupId = (0, workbenchTestServices_1.$Iec)(backupResource);
                filePathHash = (0, workingCopyBackupService_1.$j4b)(backupId);
                expectedPath = (0, resources_1.$ig)(backupHome, workspaceHash, 'custom', filePathHash).with({ scheme: network_1.Schemas.vscodeUserData }).toString();
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
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                const backupPromise = service.backup(identifier);
                assert.strictEqual(backupJoined, false);
                await backupPromise;
                assert.strictEqual(backupJoined, true);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('no text', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                await service.backup(identifier);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file (with version)', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')), 666);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                assert.ok(!service.hasBackupSync(identifier, 555));
                assert.ok(service.hasBackupSync(identifier, 666));
            });
            test('text file (with meta)', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                const meta = { etag: '678', orphaned: true };
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')), undefined, meta);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test', meta));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file with whitespace in name and type (with meta)', async () => {
                const fileWithSpace = uri_1.URI.file(platform_1.$i ? 'c:\\Foo \n Bar' : '/Foo \n Bar');
                const identifier = (0, workbenchTestServices_1.$Iec)(fileWithSpace, ' test id \n');
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                const meta = { etag: '678 \n k', orphaned: true };
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')), undefined, meta);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test', meta));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file with unicode character in name and type (with meta)', async () => {
                const fileWithUnicode = uri_1.URI.file(platform_1.$i ? 'c:\\so𒀅meࠄ' : '/so𒀅meࠄ');
                const identifier = (0, workbenchTestServices_1.$Iec)(fileWithUnicode, ' test so𒀅meࠄ id \n');
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                const meta = { etag: '678so𒀅meࠄ', orphaned: true };
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')), undefined, meta);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test', meta));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('untitled file', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(untitledFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('text file (readable)', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                const model = (0, testTextModel_1.$O0b)('test');
                await service.backup(identifier, (0, textfiles_1.$OD)(model.createSnapshot()));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                assert.ok(service.hasBackupSync(identifier));
                model.dispose();
            });
            test('untitled file (readable)', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(untitledFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                const model = (0, testTextModel_1.$O0b)('test');
                await service.backup(identifier, (0, textfiles_1.$OD)(model.createSnapshot()));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, 'test'));
                model.dispose();
            });
            test('text file (large file, stream)', () => {
                const largeString = (new Array(30 * 1024)).join('Large String\n');
                return testLargeTextFile(largeString, (0, buffer_1.$Td)(buffer_1.$Fd.fromString(largeString)));
            });
            test('text file (large file, readable)', async () => {
                const largeString = (new Array(30 * 1024)).join('Large String\n');
                const model = (0, testTextModel_1.$O0b)(largeString);
                await testLargeTextFile(largeString, (0, textfiles_1.$OD)(model.createSnapshot()));
                model.dispose();
            });
            async function testLargeTextFile(largeString, buffer) {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                await service.backup(identifier, buffer, undefined, { largeTest: true });
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, largeString, { largeTest: true }));
                assert.ok(service.hasBackupSync(identifier));
            }
            test('untitled file (large file, readable)', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(untitledFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                const largeString = (new Array(30 * 1024)).join('Large String\n');
                const model = (0, testTextModel_1.$O0b)(largeString);
                await service.backup(identifier, (0, textfiles_1.$OD)(model.createSnapshot()));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier, largeString));
                assert.ok(service.hasBackupSync(identifier));
                model.dispose();
            });
            test('cancellation', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                const cts = new cancellation_1.$pd();
                const promise = service.backup(identifier, undefined, undefined, undefined, cts.token);
                cts.cancel();
                await promise;
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.ok(!service.hasBackupSync(identifier));
            });
            test('multiple', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                await Promise.all([
                    service.backup(identifier),
                    service.backup(identifier),
                    service.backup(identifier),
                    service.backup(identifier)
                ]);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.readFile(backupPath)).value.toString(), toExpectedPreamble(identifier));
                assert.ok(service.hasBackupSync(identifier));
            });
            test('multiple same resource, different type id', async () => {
                const backupId1 = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupId2 = (0, workbenchTestServices_1.$Iec)(fooFile, 'type1');
                const backupId3 = (0, workbenchTestServices_1.$Iec)(fooFile, 'type2');
                await Promise.all([
                    service.backup(backupId1),
                    service.backup(backupId2),
                    service.backup(backupId3)
                ]);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 3);
                for (const backupId of [backupId1, backupId2, backupId3]) {
                    const fooBackupPath = (0, resources_1.$ig)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.$j4b)(backupId));
                    assert.strictEqual((await fileService.exists(fooBackupPath)), true);
                    assert.strictEqual((await fileService.readFile(fooBackupPath)).value.toString(), toExpectedPreamble(backupId));
                    assert.ok(service.hasBackupSync(backupId));
                }
            });
        });
        suite('discardBackup', () => {
            test('joining', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.ok(service.hasBackupSync(identifier));
                let backupJoined = false;
                service.joinBackups().then(() => backupJoined = true);
                const discardBackupPromise = service.discardBackup(identifier);
                assert.strictEqual(backupJoined, false);
                await discardBackupPromise;
                assert.strictEqual(backupJoined, true);
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 0);
                assert.ok(!service.hasBackupSync(identifier));
            });
            test('text file', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                assert.ok(service.hasBackupSync(identifier));
                await service.discardBackup(identifier);
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 0);
                assert.ok(!service.hasBackupSync(identifier));
            });
            test('untitled file', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(untitledFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                await service.discardBackup(identifier);
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'untitled'))).children?.length, 0);
            });
            test('multiple same resource, different type id', async () => {
                const backupId1 = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupId2 = (0, workbenchTestServices_1.$Iec)(fooFile, 'type1');
                const backupId3 = (0, workbenchTestServices_1.$Iec)(fooFile, 'type2');
                await Promise.all([
                    service.backup(backupId1),
                    service.backup(backupId2),
                    service.backup(backupId3)
                ]);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 3);
                for (const backupId of [backupId1, backupId2, backupId3]) {
                    const backupPath = (0, resources_1.$ig)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.$j4b)(backupId));
                    await service.discardBackup(backupId);
                    assert.strictEqual((await fileService.exists(backupPath)), false);
                }
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 0);
            });
        });
        suite('discardBackups (all)', () => {
            test('text file', async () => {
                const backupId1 = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupId2 = (0, workbenchTestServices_1.$Hec)(barFile);
                const backupId3 = (0, workbenchTestServices_1.$Iec)(barFile);
                await service.backup(backupId1, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                await service.backup(backupId2, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 2);
                await service.backup(backupId3, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 3);
                await service.discardBackups();
                for (const backupId of [backupId1, backupId2, backupId3]) {
                    const backupPath = (0, resources_1.$ig)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.$j4b)(backupId));
                    assert.strictEqual((await fileService.exists(backupPath)), false);
                }
                assert.strictEqual((await fileService.exists((0, resources_1.$ig)(workspaceBackupPath, 'file'))), false);
            });
            test('untitled file', async () => {
                const backupId = (0, workbenchTestServices_1.$Hec)(untitledFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.$j4b)(backupId));
                await service.backup(backupId, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                await service.discardBackups();
                assert.strictEqual((await fileService.exists(backupPath)), false);
                assert.strictEqual((await fileService.exists((0, resources_1.$ig)(workspaceBackupPath, 'untitled'))), false);
            });
            test('can backup after discarding all', async () => {
                await service.discardBackups();
                await service.backup((0, workbenchTestServices_1.$Hec)(untitledFile), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.exists(workspaceBackupPath)), true);
            });
        });
        suite('discardBackups (except some)', () => {
            test('text file', async () => {
                const backupId1 = (0, workbenchTestServices_1.$Hec)(fooFile);
                const backupId2 = (0, workbenchTestServices_1.$Hec)(barFile);
                const backupId3 = (0, workbenchTestServices_1.$Iec)(barFile);
                await service.backup(backupId1, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 1);
                await service.backup(backupId2, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 2);
                await service.backup(backupId3, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'file'))).children?.length, 3);
                await service.discardBackups({ except: [backupId2, backupId3] });
                let backupPath = (0, resources_1.$ig)(workspaceBackupPath, backupId1.resource.scheme, (0, workingCopyBackupService_1.$j4b)(backupId1));
                assert.strictEqual((await fileService.exists(backupPath)), false);
                backupPath = (0, resources_1.$ig)(workspaceBackupPath, backupId2.resource.scheme, (0, workingCopyBackupService_1.$j4b)(backupId2));
                assert.strictEqual((await fileService.exists(backupPath)), true);
                backupPath = (0, resources_1.$ig)(workspaceBackupPath, backupId3.resource.scheme, (0, workingCopyBackupService_1.$j4b)(backupId3));
                assert.strictEqual((await fileService.exists(backupPath)), true);
                await service.discardBackups({ except: [backupId1] });
                for (const backupId of [backupId1, backupId2, backupId3]) {
                    const backupPath = (0, resources_1.$ig)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.$j4b)(backupId));
                    assert.strictEqual((await fileService.exists(backupPath)), false);
                }
            });
            test('untitled file', async () => {
                const backupId = (0, workbenchTestServices_1.$Hec)(untitledFile);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, backupId.resource.scheme, (0, workingCopyBackupService_1.$j4b)(backupId));
                await service.backup(backupId, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                assert.strictEqual((await fileService.exists(backupPath)), true);
                assert.strictEqual((await fileService.resolve((0, resources_1.$ig)(workspaceBackupPath, 'untitled'))).children?.length, 1);
                await service.discardBackups({ except: [backupId] });
                assert.strictEqual((await fileService.exists(backupPath)), true);
            });
        });
        suite('getBackups', () => {
            test('text file', async () => {
                await Promise.all([
                    service.backup((0, workbenchTestServices_1.$Hec)(fooFile), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test'))),
                    service.backup((0, workbenchTestServices_1.$Iec)(fooFile, 'type1'), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test'))),
                    service.backup((0, workbenchTestServices_1.$Iec)(fooFile, 'type2'), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')))
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
                await service.backup((0, workbenchTestServices_1.$Hec)(barFile), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')));
                backups = await service.getBackups();
                assert.strictEqual(backups.length, 4);
            });
            test('untitled file', async () => {
                await Promise.all([
                    service.backup((0, workbenchTestServices_1.$Hec)(untitledFile), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test'))),
                    service.backup((0, workbenchTestServices_1.$Iec)(untitledFile, 'type1'), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test'))),
                    service.backup((0, workbenchTestServices_1.$Iec)(untitledFile, 'type2'), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString('test')))
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
                await doTestResolveBackup((0, workbenchTestServices_1.$Hec)(resource), contents, meta, expectNoMeta);
                await doTestResolveBackup((0, workbenchTestServices_1.$Iec)(resource), contents, meta, expectNoMeta);
            }
            async function doTestResolveBackup(identifier, contents, meta, expectNoMeta) {
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString(contents)), 1, meta);
                const backup = await service.resolve(identifier);
                assert.ok(backup);
                assert.strictEqual(contents, (await (0, buffer_1.$Rd)(backup.value)).toString());
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
                await testShouldRestoreOriginalContentsWithBrokenBackup((0, workbenchTestServices_1.$Hec)(fooFile));
                await testShouldRestoreOriginalContentsWithBrokenBackup((0, workbenchTestServices_1.$Iec)(fooFile));
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
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString(contents)), 1, meta);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                const fileContents = (await fileService.readFile(backupPath)).value.toString();
                assert.strictEqual(fileContents.indexOf(identifier.resource.toString()), 0);
                const metaIndex = fileContents.indexOf('{');
                const newFileContents = fileContents.substring(0, metaIndex) + '{{' + fileContents.substr(metaIndex);
                await fileService.writeFile(backupPath, buffer_1.$Fd.fromString(newFileContents));
                const backup = await service.resolve(identifier);
                assert.ok(backup);
                assert.strictEqual(contents, (await (0, buffer_1.$Rd)(backup.value)).toString());
                assert.strictEqual(backup.meta, undefined);
            }
            test('should update metadata from file into model when resolving', async () => {
                await testShouldUpdateMetaFromFileWhenResolving((0, workbenchTestServices_1.$Hec)(fooFile));
                await testShouldUpdateMetaFromFileWhenResolving((0, workbenchTestServices_1.$Iec)(fooFile));
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
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.fromString(contents)), 1, meta);
                const backupPath = (0, resources_1.$ig)(workspaceBackupPath, identifier.resource.scheme, (0, workingCopyBackupService_1.$j4b)(identifier));
                // Simulate the condition of the backups model loading initially without
                // meta data information and then getting the meta data updated on the
                // first call to resolve the backup. We simulate this by explicitly changing
                // the meta data in the file and then verifying that the updated meta data
                // is persisted back into the model (verified via `hasBackupSync`).
                // This is not really something that would happen in real life because any
                // backup that is made via backup service will update the model accordingly.
                const originalFileContents = (await fileService.readFile(backupPath)).value.toString();
                await fileService.writeFile(backupPath, buffer_1.$Fd.fromString(originalFileContents.replace(meta.etag, updatedMeta.etag)));
                await service.resolve(identifier);
                assert.strictEqual(service.hasBackupSync(identifier, undefined, meta), false);
                assert.strictEqual(service.hasBackupSync(identifier, undefined, updatedMeta), true);
                await fileService.writeFile(backupPath, buffer_1.$Fd.fromString(originalFileContents));
                await service.getBackups();
                assert.strictEqual(service.hasBackupSync(identifier, undefined, meta), true);
                assert.strictEqual(service.hasBackupSync(identifier, undefined, updatedMeta), false);
            }
            test('should ignore invalid backups (empty file)', async () => {
                const contents = 'test\nand more stuff';
                await service.backup((0, workbenchTestServices_1.$Hec)(fooFile), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString(contents)), 1);
                let backup = await service.resolve((0, workbenchTestServices_1.$Hec)(fooFile));
                assert.ok(backup);
                await service.testGetFileService().writeFile(service.toBackupResource((0, workbenchTestServices_1.$Hec)(fooFile)), buffer_1.$Fd.fromString(''));
                backup = await service.resolve((0, workbenchTestServices_1.$Hec)(fooFile));
                assert.ok(!backup);
            });
            test('should ignore invalid backups (no preamble)', async () => {
                const contents = 'testand more stuff';
                await service.backup((0, workbenchTestServices_1.$Hec)(fooFile), (0, buffer_1.$Qd)(buffer_1.$Fd.fromString(contents)), 1);
                let backup = await service.resolve((0, workbenchTestServices_1.$Hec)(fooFile));
                assert.ok(backup);
                await service.testGetFileService().writeFile(service.toBackupResource((0, workbenchTestServices_1.$Hec)(fooFile)), buffer_1.$Fd.fromString(contents));
                backup = await service.resolve((0, workbenchTestServices_1.$Hec)(fooFile));
                assert.ok(!backup);
            });
            test('file with binary data', async () => {
                const identifier = (0, workbenchTestServices_1.$Hec)(fooFile);
                const buffer = Uint8Array.from([
                    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 73, 0, 0, 0, 67, 8, 2, 0, 0, 0, 95, 138, 191, 237, 0, 0, 0, 1, 115, 82, 71, 66, 0, 174, 206, 28, 233, 0, 0, 0, 4, 103, 65, 77, 65, 0, 0, 177, 143, 11, 252, 97, 5, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 14, 195, 0, 0, 14, 195, 1, 199, 111, 168, 100, 0, 0, 0, 71, 116, 69, 88, 116, 83, 111, 117, 114, 99, 101, 0, 83, 104, 111, 116, 116, 121, 32, 118, 50, 46, 48, 46, 50, 46, 50, 49, 54, 32, 40, 67, 41, 32, 84, 104, 111, 109, 97, 115, 32, 66, 97, 117, 109, 97, 110, 110, 32, 45, 32, 104, 116, 116, 112, 58, 47, 47, 115, 104, 111, 116, 116, 121, 46, 100, 101, 118, 115, 45, 111, 110, 46, 110, 101, 116, 44, 132, 21, 213, 0, 0, 0, 84, 73, 68, 65, 84, 120, 218, 237, 207, 65, 17, 0, 0, 12, 2, 32, 211, 217, 63, 146, 37, 246, 218, 65, 3, 210, 191, 226, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 230, 118, 100, 169, 4, 173, 8, 44, 248, 184, 40, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
                ]);
                await service.backup(identifier, (0, buffer_1.$Qd)(buffer_1.$Fd.wrap(buffer)), undefined, { binaryTest: 'true' });
                const backup = await service.resolve((0, workbenchTestServices_1.$Hec)(fooFile));
                assert.ok(backup);
                const backupBuffer = await (0, stream_1.$wd)(backup.value, chunks => buffer_1.$Fd.concat(chunks));
                assert.strictEqual(backupBuffer.buffer.byteLength, buffer.byteLength);
            });
        });
        suite('WorkingCopyBackupsModel', () => {
            test('simple', async () => {
                const model = await workingCopyBackupService_1.$g4b.create(workspaceBackupPath, service.testGetFileService());
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
                const fooBackupPath = (0, resources_1.$ig)(workspaceBackupPath, fooFile.scheme, (0, workingCopyBackupService_1.$j4b)((0, workbenchTestServices_1.$Hec)(fooFile)));
                await fileService.createFolder((0, resources_1.$hg)(fooBackupPath));
                await fileService.writeFile(fooBackupPath, buffer_1.$Fd.fromString('foo'));
                const model = await workingCopyBackupService_1.$g4b.create(workspaceBackupPath, service.testGetFileService());
                assert.strictEqual(model.has(fooBackupPath), true);
            });
            test('get', async () => {
                const model = await workingCopyBackupService_1.$g4b.create(workspaceBackupPath, service.testGetFileService());
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
                const fooBackupId = (0, workbenchTestServices_1.$Hec)(fooFile);
                const untitledBackupId = (0, workbenchTestServices_1.$Hec)(untitledFile);
                const customBackupId = (0, workbenchTestServices_1.$Hec)(customFile);
                const fooBackupPath = (0, resources_1.$ig)(workspaceBackupPath, fooFile.scheme, (0, workingCopyBackupService_1.$j4b)(fooBackupId));
                const untitledBackupPath = (0, resources_1.$ig)(workspaceBackupPath, untitledFile.scheme, (0, workingCopyBackupService_1.$j4b)(untitledBackupId));
                const customFileBackupPath = (0, resources_1.$ig)(workspaceBackupPath, customFile.scheme, (0, workingCopyBackupService_1.$j4b)(customBackupId));
                // Prepare backups of the old format without meta
                await fileService.createFolder((0, resources_1.$ig)(workspaceBackupPath, fooFile.scheme));
                await fileService.createFolder((0, resources_1.$ig)(workspaceBackupPath, untitledFile.scheme));
                await fileService.createFolder((0, resources_1.$ig)(workspaceBackupPath, customFile.scheme));
                await fileService.writeFile(fooBackupPath, buffer_1.$Fd.fromString(`${fooFile.toString()}\ntest file`));
                await fileService.writeFile(untitledBackupPath, buffer_1.$Fd.fromString(`${untitledFile.toString()}\ntest untitled`));
                await fileService.writeFile(customFileBackupPath, buffer_1.$Fd.fromString(`${customFile.toString()}\ntest custom`));
                service.reinitialize(workspaceBackupPath);
                const backups = await service.getBackups();
                assert.strictEqual(backups.length, 3);
                assert.ok(backups.some(backup => (0, resources_1.$bg)(backup.resource, fooFile)));
                assert.ok(backups.some(backup => (0, resources_1.$bg)(backup.resource, untitledFile)));
                assert.ok(backups.some(backup => (0, resources_1.$bg)(backup.resource, customFile)));
                assert.ok(backups.every(backup => backup.typeId === ''));
            });
            test('works (when typeId in meta is missing)', async () => {
                const fooBackupId = (0, workbenchTestServices_1.$Hec)(fooFile);
                const untitledBackupId = (0, workbenchTestServices_1.$Hec)(untitledFile);
                const customBackupId = (0, workbenchTestServices_1.$Hec)(customFile);
                const fooBackupPath = (0, resources_1.$ig)(workspaceBackupPath, fooFile.scheme, (0, workingCopyBackupService_1.$j4b)(fooBackupId));
                const untitledBackupPath = (0, resources_1.$ig)(workspaceBackupPath, untitledFile.scheme, (0, workingCopyBackupService_1.$j4b)(untitledBackupId));
                const customFileBackupPath = (0, resources_1.$ig)(workspaceBackupPath, customFile.scheme, (0, workingCopyBackupService_1.$j4b)(customBackupId));
                // Prepare backups of the old format without meta
                await fileService.createFolder((0, resources_1.$ig)(workspaceBackupPath, fooFile.scheme));
                await fileService.createFolder((0, resources_1.$ig)(workspaceBackupPath, untitledFile.scheme));
                await fileService.createFolder((0, resources_1.$ig)(workspaceBackupPath, customFile.scheme));
                await fileService.writeFile(fooBackupPath, buffer_1.$Fd.fromString(`${fooFile.toString()} ${JSON.stringify({ foo: 'bar' })}\ntest file`));
                await fileService.writeFile(untitledBackupPath, buffer_1.$Fd.fromString(`${untitledFile.toString()} ${JSON.stringify({ foo: 'bar' })}\ntest untitled`));
                await fileService.writeFile(customFileBackupPath, buffer_1.$Fd.fromString(`${customFile.toString()} ${JSON.stringify({ foo: 'bar' })}\ntest custom`));
                service.reinitialize(workspaceBackupPath);
                const backups = await service.getBackups();
                assert.strictEqual(backups.length, 3);
                assert.ok(backups.some(backup => (0, resources_1.$bg)(backup.resource, fooFile)));
                assert.ok(backups.some(backup => (0, resources_1.$bg)(backup.resource, untitledFile)));
                assert.ok(backups.some(backup => (0, resources_1.$bg)(backup.resource, customFile)));
                assert.ok(backups.every(backup => backup.typeId === ''));
            });
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=workingCopyBackupService.test.js.map