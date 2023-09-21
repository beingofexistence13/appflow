/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/base/common/network", "vs/base/common/uri", "vs/platform/userData/common/fileUserDataProvider", "vs/base/common/resources", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/environment/common/environmentService", "vs/platform/product/common/product", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/utils"], function (require, exports, assert, fileService_1, log_1, network_1, uri_1, fileUserDataProvider_1, resources_1, buffer_1, lifecycle_1, event_1, inMemoryFilesystemProvider_1, environmentService_1, product_1, userDataProfile_1, uriIdentityService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
    class TestEnvironmentService extends environmentService_1.AbstractNativeEnvironmentService {
        constructor(_appSettingsHome) {
            super(Object.create(null), Object.create(null), { _serviceBrand: undefined, ...product_1.default });
            this._appSettingsHome = _appSettingsHome;
        }
        get userRoamingDataHome() { return this._appSettingsHome.with({ scheme: network_1.Schemas.vscodeUserData }); }
        get cacheHome() { return this.userRoamingDataHome; }
    }
    suite('FileUserDataProvider', () => {
        let testObject;
        let userDataHomeOnDisk;
        let backupWorkspaceHomeOnDisk;
        let environmentService;
        let userDataProfilesService;
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let fileUserDataProvider;
        setup(async () => {
            const logService = new log_1.NullLogService();
            testObject = disposables.add(new fileService_1.FileService(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            disposables.add(testObject.registerProvider(ROOT.scheme, fileSystemProvider));
            userDataHomeOnDisk = (0, resources_1.joinPath)(ROOT, 'User');
            const backupHome = (0, resources_1.joinPath)(ROOT, 'Backups');
            backupWorkspaceHomeOnDisk = (0, resources_1.joinPath)(backupHome, 'workspaceId');
            await testObject.createFolder(userDataHomeOnDisk);
            await testObject.createFolder(backupWorkspaceHomeOnDisk);
            environmentService = new TestEnvironmentService(userDataHomeOnDisk);
            const uriIdentityService = disposables.add(new uriIdentityService_1.UriIdentityService(testObject));
            userDataProfilesService = disposables.add(new userDataProfile_1.UserDataProfilesService(environmentService, testObject, uriIdentityService, logService));
            fileUserDataProvider = disposables.add(new fileUserDataProvider_1.FileUserDataProvider(ROOT.scheme, fileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
            disposables.add(fileUserDataProvider);
            disposables.add(testObject.registerProvider(network_1.Schemas.vscodeUserData, fileUserDataProvider));
        });
        test('exists return false when file does not exist', async () => {
            const exists = await testObject.exists(userDataProfilesService.defaultProfile.settingsResource);
            assert.strictEqual(exists, false);
        });
        test('read file throws error if not exist', async () => {
            try {
                await testObject.readFile(userDataProfilesService.defaultProfile.settingsResource);
                assert.fail('Should fail since file does not exist');
            }
            catch (e) { }
        });
        test('read existing file', async () => {
            await testObject.writeFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'settings.json'), buffer_1.VSBuffer.fromString('{}'));
            const result = await testObject.readFile(userDataProfilesService.defaultProfile.settingsResource);
            assert.strictEqual(result.value.toString(), '{}');
        });
        test('create file', async () => {
            const resource = userDataProfilesService.defaultProfile.settingsResource;
            const actual1 = await testObject.createFile(resource, buffer_1.VSBuffer.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{}');
        });
        test('write file creates the file if not exist', async () => {
            const resource = userDataProfilesService.defaultProfile.settingsResource;
            const actual1 = await testObject.writeFile(resource, buffer_1.VSBuffer.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{}');
        });
        test('write to existing file', async () => {
            const resource = userDataProfilesService.defaultProfile.settingsResource;
            await testObject.writeFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'settings.json'), buffer_1.VSBuffer.fromString('{}'));
            const actual1 = await testObject.writeFile(resource, buffer_1.VSBuffer.fromString('{a:1}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{a:1}');
        });
        test('delete file', async () => {
            await testObject.writeFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'settings.json'), buffer_1.VSBuffer.fromString(''));
            await testObject.del(userDataProfilesService.defaultProfile.settingsResource);
            const result = await testObject.exists((0, resources_1.joinPath)(userDataHomeOnDisk, 'settings.json'));
            assert.strictEqual(false, result);
        });
        test('resolve file', async () => {
            await testObject.writeFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'settings.json'), buffer_1.VSBuffer.fromString(''));
            const result = await testObject.resolve(userDataProfilesService.defaultProfile.settingsResource);
            assert.ok(!result.isDirectory);
            assert.ok(result.children === undefined);
        });
        test('exists return false for folder that does not exist', async () => {
            const exists = await testObject.exists(userDataProfilesService.defaultProfile.snippetsHome);
            assert.strictEqual(exists, false);
        });
        test('exists return true for folder that exists', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets'));
            const exists = await testObject.exists(userDataProfilesService.defaultProfile.snippetsHome);
            assert.strictEqual(exists, true);
        });
        test('read file throws error for folder', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets'));
            try {
                await testObject.readFile(userDataProfilesService.defaultProfile.snippetsHome);
                assert.fail('Should fail since read file is not supported for folders');
            }
            catch (e) { }
        });
        test('read file under folder', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets'));
            await testObject.writeFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'), buffer_1.VSBuffer.fromString('{}'));
            const resource = (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual = await testObject.readFile(resource);
            assert.strictEqual(actual.resource.toString(), resource.toString());
            assert.strictEqual(actual.value.toString(), '{}');
        });
        test('read file under sub folder', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'java'));
            await testObject.writeFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'java', 'settings.json'), buffer_1.VSBuffer.fromString('{}'));
            const resource = (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'java/settings.json');
            const actual = await testObject.readFile(resource);
            assert.strictEqual(actual.resource.toString(), resource.toString());
            assert.strictEqual(actual.value.toString(), '{}');
        });
        test('create file under folder that exists', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets'));
            const resource = (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.createFile(resource, buffer_1.VSBuffer.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{}');
        });
        test('create file under folder that does not exist', async () => {
            const resource = (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.createFile(resource, buffer_1.VSBuffer.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{}');
        });
        test('write to not existing file under container that exists', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets'));
            const resource = (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.writeFile(resource, buffer_1.VSBuffer.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual = await testObject.readFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual.value.toString(), '{}');
        });
        test('write to not existing file under container that does not exists', async () => {
            const resource = (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.writeFile(resource, buffer_1.VSBuffer.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual = await testObject.readFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual.value.toString(), '{}');
        });
        test('write to existing file under container', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets'));
            await testObject.writeFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'), buffer_1.VSBuffer.fromString('{}'));
            const resource = (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.writeFile(resource, buffer_1.VSBuffer.fromString('{a:1}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual = await testObject.readFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual.value.toString(), '{a:1}');
        });
        test('write file under sub container', async () => {
            const resource = (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'java/settings.json');
            const actual1 = await testObject.writeFile(resource, buffer_1.VSBuffer.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual = await testObject.readFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'java', 'settings.json'));
            assert.strictEqual(actual.value.toString(), '{}');
        });
        test('delete throws error for folder that does not exist', async () => {
            try {
                await testObject.del(userDataProfilesService.defaultProfile.snippetsHome);
                assert.fail('Should fail the folder does not exist');
            }
            catch (e) { }
        });
        test('delete not existing file under container that exists', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets'));
            try {
                await testObject.del((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json'));
                assert.fail('Should fail since file does not exist');
            }
            catch (e) { }
        });
        test('delete not existing file under container that does not exists', async () => {
            try {
                await testObject.del((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json'));
                assert.fail('Should fail since file does not exist');
            }
            catch (e) { }
        });
        test('delete existing file under folder', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets'));
            await testObject.writeFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'), buffer_1.VSBuffer.fromString('{}'));
            await testObject.del((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json'));
            const exists = await testObject.exists((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(exists, false);
        });
        test('resolve folder', async () => {
            await testObject.createFolder((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets'));
            await testObject.writeFile((0, resources_1.joinPath)(userDataHomeOnDisk, 'snippets', 'settings.json'), buffer_1.VSBuffer.fromString('{}'));
            const result = await testObject.resolve(userDataProfilesService.defaultProfile.snippetsHome);
            assert.ok(result.isDirectory);
            assert.ok(result.children !== undefined);
            assert.strictEqual(result.children.length, 1);
            assert.strictEqual(result.children[0].resource.toString(), (0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json').toString());
        });
        test('read backup file', async () => {
            await testObject.writeFile((0, resources_1.joinPath)(backupWorkspaceHomeOnDisk, 'backup.json'), buffer_1.VSBuffer.fromString('{}'));
            const result = await testObject.readFile((0, resources_1.joinPath)(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`));
            assert.strictEqual(result.value.toString(), '{}');
        });
        test('create backup file', async () => {
            await testObject.createFile((0, resources_1.joinPath)(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`), buffer_1.VSBuffer.fromString('{}'));
            const result = await testObject.readFile((0, resources_1.joinPath)(backupWorkspaceHomeOnDisk, 'backup.json'));
            assert.strictEqual(result.value.toString(), '{}');
        });
        test('write backup file', async () => {
            await testObject.writeFile((0, resources_1.joinPath)(backupWorkspaceHomeOnDisk, 'backup.json'), buffer_1.VSBuffer.fromString('{}'));
            await testObject.writeFile((0, resources_1.joinPath)(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`), buffer_1.VSBuffer.fromString('{a:1}'));
            const result = await testObject.readFile((0, resources_1.joinPath)(backupWorkspaceHomeOnDisk, 'backup.json'));
            assert.strictEqual(result.value.toString(), '{a:1}');
        });
        test('resolve backups folder', async () => {
            await testObject.writeFile((0, resources_1.joinPath)(backupWorkspaceHomeOnDisk, 'backup.json'), buffer_1.VSBuffer.fromString('{}'));
            const result = await testObject.resolve(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }));
            assert.ok(result.isDirectory);
            assert.ok(result.children !== undefined);
            assert.strictEqual(result.children.length, 1);
            assert.strictEqual(result.children[0].resource.toString(), (0, resources_1.joinPath)(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`).toString());
        });
    });
    class TestFileSystemProvider {
        constructor(onDidChangeFile) {
            this.onDidChangeFile = onDidChangeFile;
            this.capabilities = 2 /* FileSystemProviderCapabilities.FileReadWrite */;
            this.onDidChangeCapabilities = event_1.Event.None;
        }
        watch() { return lifecycle_1.Disposable.None; }
        stat() { throw new Error('Not Supported'); }
        mkdir(resource) { throw new Error('Not Supported'); }
        rename() { throw new Error('Not Supported'); }
        readFile(resource) { throw new Error('Not Supported'); }
        readdir(resource) { throw new Error('Not Supported'); }
        writeFile() { throw new Error('Not Supported'); }
        delete() { throw new Error('Not Supported'); }
    }
    suite('FileUserDataProvider - Watching', () => {
        let testObject;
        const disposables = new lifecycle_1.DisposableStore();
        const rootFileResource = (0, resources_1.joinPath)(ROOT, 'User');
        const rootUserDataResource = rootFileResource.with({ scheme: network_1.Schemas.vscodeUserData });
        let fileEventEmitter;
        setup(() => {
            const logService = new log_1.NullLogService();
            const fileService = disposables.add(new fileService_1.FileService(logService));
            const environmentService = new TestEnvironmentService(rootFileResource);
            const uriIdentityService = disposables.add(new uriIdentityService_1.UriIdentityService(fileService));
            const userDataProfilesService = disposables.add(new userDataProfile_1.UserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
            fileEventEmitter = disposables.add(new event_1.Emitter());
            testObject = disposables.add(new fileUserDataProvider_1.FileUserDataProvider(rootFileResource.scheme, new TestFileSystemProvider(fileEventEmitter.event), network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, new log_1.NullLogService()));
        });
        teardown(() => disposables.clear());
        test('file added change event', done => {
            disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
            const expected = (0, resources_1.joinPath)(rootUserDataResource, 'settings.json');
            const target = (0, resources_1.joinPath)(rootFileResource, 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.isEqual)(e[0].resource, expected) && e[0].type === 1 /* FileChangeType.ADDED */) {
                    done();
                }
            }));
            fileEventEmitter.fire([{
                    resource: target,
                    type: 1 /* FileChangeType.ADDED */
                }]);
        });
        test('file updated change event', done => {
            disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
            const expected = (0, resources_1.joinPath)(rootUserDataResource, 'settings.json');
            const target = (0, resources_1.joinPath)(rootFileResource, 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.isEqual)(e[0].resource, expected) && e[0].type === 0 /* FileChangeType.UPDATED */) {
                    done();
                }
            }));
            fileEventEmitter.fire([{
                    resource: target,
                    type: 0 /* FileChangeType.UPDATED */
                }]);
        });
        test('file deleted change event', done => {
            disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
            const expected = (0, resources_1.joinPath)(rootUserDataResource, 'settings.json');
            const target = (0, resources_1.joinPath)(rootFileResource, 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.isEqual)(e[0].resource, expected) && e[0].type === 2 /* FileChangeType.DELETED */) {
                    done();
                }
            }));
            fileEventEmitter.fire([{
                    resource: target,
                    type: 2 /* FileChangeType.DELETED */
                }]);
        });
        test('file under folder created change event', done => {
            disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
            const expected = (0, resources_1.joinPath)(rootUserDataResource, 'snippets', 'settings.json');
            const target = (0, resources_1.joinPath)(rootFileResource, 'snippets', 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.isEqual)(e[0].resource, expected) && e[0].type === 1 /* FileChangeType.ADDED */) {
                    done();
                }
            }));
            fileEventEmitter.fire([{
                    resource: target,
                    type: 1 /* FileChangeType.ADDED */
                }]);
        });
        test('file under folder updated change event', done => {
            disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
            const expected = (0, resources_1.joinPath)(rootUserDataResource, 'snippets', 'settings.json');
            const target = (0, resources_1.joinPath)(rootFileResource, 'snippets', 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.isEqual)(e[0].resource, expected) && e[0].type === 0 /* FileChangeType.UPDATED */) {
                    done();
                }
            }));
            fileEventEmitter.fire([{
                    resource: target,
                    type: 0 /* FileChangeType.UPDATED */
                }]);
        });
        test('file under folder deleted change event', done => {
            disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
            const expected = (0, resources_1.joinPath)(rootUserDataResource, 'snippets', 'settings.json');
            const target = (0, resources_1.joinPath)(rootFileResource, 'snippets', 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.isEqual)(e[0].resource, expected) && e[0].type === 2 /* FileChangeType.DELETED */) {
                    done();
                }
            }));
            fileEventEmitter.fire([{
                    resource: target,
                    type: 2 /* FileChangeType.DELETED */
                }]);
        });
        test('event is not triggered if not watched', async () => {
            const target = (0, resources_1.joinPath)(rootFileResource, 'settings.json');
            let triggered = false;
            testObject.onDidChangeFile(() => triggered = true);
            fileEventEmitter.fire([{
                    resource: target,
                    type: 2 /* FileChangeType.DELETED */
                }]);
            if (triggered) {
                assert.fail('event should not be triggered');
            }
        });
        test('event is not triggered if not watched 2', async () => {
            disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
            const target = (0, resources_1.joinPath)((0, resources_1.dirname)(rootFileResource), 'settings.json');
            let triggered = false;
            testObject.onDidChangeFile(() => triggered = true);
            fileEventEmitter.fire([{
                    resource: target,
                    type: 2 /* FileChangeType.DELETED */
                }]);
            if (triggered) {
                assert.fail('event should not be triggered');
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVVzZXJEYXRhUHJvdmlkZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhL3Rlc3QvYnJvd3Nlci9maWxlVXNlckRhdGFQcm92aWRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBcUJoRyxNQUFNLElBQUksR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBRWhFLE1BQU0sc0JBQXVCLFNBQVEscURBQWdDO1FBQ3BFLFlBQTZCLGdCQUFxQjtZQUNqRCxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxHQUFHLGlCQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRDlELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBSztRQUVsRCxDQUFDO1FBQ0QsSUFBYSxtQkFBbUIsS0FBSyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RyxJQUFhLFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7S0FDN0Q7SUFFRCxLQUFLLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1FBRWxDLElBQUksVUFBd0IsQ0FBQztRQUM3QixJQUFJLGtCQUF1QixDQUFDO1FBQzVCLElBQUkseUJBQThCLENBQUM7UUFDbkMsSUFBSSxrQkFBdUMsQ0FBQztRQUM1QyxJQUFJLHVCQUFpRCxDQUFDO1FBQ3RELE1BQU0sV0FBVyxHQUFHLElBQUEs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