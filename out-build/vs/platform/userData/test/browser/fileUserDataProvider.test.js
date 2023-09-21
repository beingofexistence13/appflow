/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/base/common/network", "vs/base/common/uri", "vs/platform/userData/common/fileUserDataProvider", "vs/base/common/resources", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/environment/common/environmentService", "vs/platform/product/common/product", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/utils"], function (require, exports, assert, fileService_1, log_1, network_1, uri_1, fileUserDataProvider_1, resources_1, buffer_1, lifecycle_1, event_1, inMemoryFilesystemProvider_1, environmentService_1, product_1, userDataProfile_1, uriIdentityService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
    class TestEnvironmentService extends environmentService_1.$9l {
        constructor(d) {
            super(Object.create(null), Object.create(null), { _serviceBrand: undefined, ...product_1.default });
            this.d = d;
        }
        get userRoamingDataHome() { return this.d.with({ scheme: network_1.Schemas.vscodeUserData }); }
        get cacheHome() { return this.userRoamingDataHome; }
    }
    suite('FileUserDataProvider', () => {
        let testObject;
        let userDataHomeOnDisk;
        let backupWorkspaceHomeOnDisk;
        let environmentService;
        let userDataProfilesService;
        const disposables = (0, utils_1.$bT)();
        let fileUserDataProvider;
        setup(async () => {
            const logService = new log_1.$fj();
            testObject = disposables.add(new fileService_1.$Dp(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(testObject.registerProvider(ROOT.scheme, fileSystemProvider));
            userDataHomeOnDisk = (0, resources_1.$ig)(ROOT, 'User');
            const backupHome = (0, resources_1.$ig)(ROOT, 'Backups');
            backupWorkspaceHomeOnDisk = (0, resources_1.$ig)(backupHome, 'workspaceId');
            await testObject.createFolder(userDataHomeOnDisk);
            await testObject.createFolder(backupWorkspaceHomeOnDisk);
            environmentService = new TestEnvironmentService(userDataHomeOnDisk);
            const uriIdentityService = disposables.add(new uriIdentityService_1.$pr(testObject));
            userDataProfilesService = disposables.add(new userDataProfile_1.$Hk(environmentService, testObject, uriIdentityService, logService));
            fileUserDataProvider = disposables.add(new fileUserDataProvider_1.$n7b(ROOT.scheme, fileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService));
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
            await testObject.writeFile((0, resources_1.$ig)(userDataHomeOnDisk, 'settings.json'), buffer_1.$Fd.fromString('{}'));
            const result = await testObject.readFile(userDataProfilesService.defaultProfile.settingsResource);
            assert.strictEqual(result.value.toString(), '{}');
        });
        test('create file', async () => {
            const resource = userDataProfilesService.defaultProfile.settingsResource;
            const actual1 = await testObject.createFile(resource, buffer_1.$Fd.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.$ig)(userDataHomeOnDisk, 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{}');
        });
        test('write file creates the file if not exist', async () => {
            const resource = userDataProfilesService.defaultProfile.settingsResource;
            const actual1 = await testObject.writeFile(resource, buffer_1.$Fd.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.$ig)(userDataHomeOnDisk, 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{}');
        });
        test('write to existing file', async () => {
            const resource = userDataProfilesService.defaultProfile.settingsResource;
            await testObject.writeFile((0, resources_1.$ig)(userDataHomeOnDisk, 'settings.json'), buffer_1.$Fd.fromString('{}'));
            const actual1 = await testObject.writeFile(resource, buffer_1.$Fd.fromString('{a:1}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.$ig)(userDataHomeOnDisk, 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{a:1}');
        });
        test('delete file', async () => {
            await testObject.writeFile((0, resources_1.$ig)(userDataHomeOnDisk, 'settings.json'), buffer_1.$Fd.fromString(''));
            await testObject.del(userDataProfilesService.defaultProfile.settingsResource);
            const result = await testObject.exists((0, resources_1.$ig)(userDataHomeOnDisk, 'settings.json'));
            assert.strictEqual(false, result);
        });
        test('resolve file', async () => {
            await testObject.writeFile((0, resources_1.$ig)(userDataHomeOnDisk, 'settings.json'), buffer_1.$Fd.fromString(''));
            const result = await testObject.resolve(userDataProfilesService.defaultProfile.settingsResource);
            assert.ok(!result.isDirectory);
            assert.ok(result.children === undefined);
        });
        test('exists return false for folder that does not exist', async () => {
            const exists = await testObject.exists(userDataProfilesService.defaultProfile.snippetsHome);
            assert.strictEqual(exists, false);
        });
        test('exists return true for folder that exists', async () => {
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets'));
            const exists = await testObject.exists(userDataProfilesService.defaultProfile.snippetsHome);
            assert.strictEqual(exists, true);
        });
        test('read file throws error for folder', async () => {
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets'));
            try {
                await testObject.readFile(userDataProfilesService.defaultProfile.snippetsHome);
                assert.fail('Should fail since read file is not supported for folders');
            }
            catch (e) { }
        });
        test('read file under folder', async () => {
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets'));
            await testObject.writeFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'), buffer_1.$Fd.fromString('{}'));
            const resource = (0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual = await testObject.readFile(resource);
            assert.strictEqual(actual.resource.toString(), resource.toString());
            assert.strictEqual(actual.value.toString(), '{}');
        });
        test('read file under sub folder', async () => {
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'java'));
            await testObject.writeFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'java', 'settings.json'), buffer_1.$Fd.fromString('{}'));
            const resource = (0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'java/settings.json');
            const actual = await testObject.readFile(resource);
            assert.strictEqual(actual.resource.toString(), resource.toString());
            assert.strictEqual(actual.value.toString(), '{}');
        });
        test('create file under folder that exists', async () => {
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets'));
            const resource = (0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.createFile(resource, buffer_1.$Fd.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{}');
        });
        test('create file under folder that does not exist', async () => {
            const resource = (0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.createFile(resource, buffer_1.$Fd.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual2 = await testObject.readFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual2.value.toString(), '{}');
        });
        test('write to not existing file under container that exists', async () => {
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets'));
            const resource = (0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.writeFile(resource, buffer_1.$Fd.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual = await testObject.readFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual.value.toString(), '{}');
        });
        test('write to not existing file under container that does not exists', async () => {
            const resource = (0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.writeFile(resource, buffer_1.$Fd.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual = await testObject.readFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual.value.toString(), '{}');
        });
        test('write to existing file under container', async () => {
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets'));
            await testObject.writeFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'), buffer_1.$Fd.fromString('{}'));
            const resource = (0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json');
            const actual1 = await testObject.writeFile(resource, buffer_1.$Fd.fromString('{a:1}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual = await testObject.readFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(actual.value.toString(), '{a:1}');
        });
        test('write file under sub container', async () => {
            const resource = (0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'java/settings.json');
            const actual1 = await testObject.writeFile(resource, buffer_1.$Fd.fromString('{}'));
            assert.strictEqual(actual1.resource.toString(), resource.toString());
            const actual = await testObject.readFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'java', 'settings.json'));
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
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets'));
            try {
                await testObject.del((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json'));
                assert.fail('Should fail since file does not exist');
            }
            catch (e) { }
        });
        test('delete not existing file under container that does not exists', async () => {
            try {
                await testObject.del((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json'));
                assert.fail('Should fail since file does not exist');
            }
            catch (e) { }
        });
        test('delete existing file under folder', async () => {
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets'));
            await testObject.writeFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'), buffer_1.$Fd.fromString('{}'));
            await testObject.del((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json'));
            const exists = await testObject.exists((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'));
            assert.strictEqual(exists, false);
        });
        test('resolve folder', async () => {
            await testObject.createFolder((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets'));
            await testObject.writeFile((0, resources_1.$ig)(userDataHomeOnDisk, 'snippets', 'settings.json'), buffer_1.$Fd.fromString('{}'));
            const result = await testObject.resolve(userDataProfilesService.defaultProfile.snippetsHome);
            assert.ok(result.isDirectory);
            assert.ok(result.children !== undefined);
            assert.strictEqual(result.children.length, 1);
            assert.strictEqual(result.children[0].resource.toString(), (0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'settings.json').toString());
        });
        test('read backup file', async () => {
            await testObject.writeFile((0, resources_1.$ig)(backupWorkspaceHomeOnDisk, 'backup.json'), buffer_1.$Fd.fromString('{}'));
            const result = await testObject.readFile((0, resources_1.$ig)(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`));
            assert.strictEqual(result.value.toString(), '{}');
        });
        test('create backup file', async () => {
            await testObject.createFile((0, resources_1.$ig)(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`), buffer_1.$Fd.fromString('{}'));
            const result = await testObject.readFile((0, resources_1.$ig)(backupWorkspaceHomeOnDisk, 'backup.json'));
            assert.strictEqual(result.value.toString(), '{}');
        });
        test('write backup file', async () => {
            await testObject.writeFile((0, resources_1.$ig)(backupWorkspaceHomeOnDisk, 'backup.json'), buffer_1.$Fd.fromString('{}'));
            await testObject.writeFile((0, resources_1.$ig)(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`), buffer_1.$Fd.fromString('{a:1}'));
            const result = await testObject.readFile((0, resources_1.$ig)(backupWorkspaceHomeOnDisk, 'backup.json'));
            assert.strictEqual(result.value.toString(), '{a:1}');
        });
        test('resolve backups folder', async () => {
            await testObject.writeFile((0, resources_1.$ig)(backupWorkspaceHomeOnDisk, 'backup.json'), buffer_1.$Fd.fromString('{}'));
            const result = await testObject.resolve(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }));
            assert.ok(result.isDirectory);
            assert.ok(result.children !== undefined);
            assert.strictEqual(result.children.length, 1);
            assert.strictEqual(result.children[0].resource.toString(), (0, resources_1.$ig)(backupWorkspaceHomeOnDisk.with({ scheme: environmentService.userRoamingDataHome.scheme }), `backup.json`).toString());
        });
    });
    class TestFileSystemProvider {
        constructor(onDidChangeFile) {
            this.onDidChangeFile = onDidChangeFile;
            this.capabilities = 2 /* FileSystemProviderCapabilities.FileReadWrite */;
            this.onDidChangeCapabilities = event_1.Event.None;
        }
        watch() { return lifecycle_1.$kc.None; }
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
        const disposables = new lifecycle_1.$jc();
        const rootFileResource = (0, resources_1.$ig)(ROOT, 'User');
        const rootUserDataResource = rootFileResource.with({ scheme: network_1.Schemas.vscodeUserData });
        let fileEventEmitter;
        setup(() => {
            const logService = new log_1.$fj();
            const fileService = disposables.add(new fileService_1.$Dp(logService));
            const environmentService = new TestEnvironmentService(rootFileResource);
            const uriIdentityService = disposables.add(new uriIdentityService_1.$pr(fileService));
            const userDataProfilesService = disposables.add(new userDataProfile_1.$Hk(environmentService, fileService, uriIdentityService, logService));
            fileEventEmitter = disposables.add(new event_1.$fd());
            testObject = disposables.add(new fileUserDataProvider_1.$n7b(rootFileResource.scheme, new TestFileSystemProvider(fileEventEmitter.event), network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, new log_1.$fj()));
        });
        teardown(() => disposables.clear());
        test('file added change event', done => {
            disposables.add(testObject.watch(rootUserDataResource, { excludes: [], recursive: false }));
            const expected = (0, resources_1.$ig)(rootUserDataResource, 'settings.json');
            const target = (0, resources_1.$ig)(rootFileResource, 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.$bg)(e[0].resource, expected) && e[0].type === 1 /* FileChangeType.ADDED */) {
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
            const expected = (0, resources_1.$ig)(rootUserDataResource, 'settings.json');
            const target = (0, resources_1.$ig)(rootFileResource, 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.$bg)(e[0].resource, expected) && e[0].type === 0 /* FileChangeType.UPDATED */) {
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
            const expected = (0, resources_1.$ig)(rootUserDataResource, 'settings.json');
            const target = (0, resources_1.$ig)(rootFileResource, 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.$bg)(e[0].resource, expected) && e[0].type === 2 /* FileChangeType.DELETED */) {
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
            const expected = (0, resources_1.$ig)(rootUserDataResource, 'snippets', 'settings.json');
            const target = (0, resources_1.$ig)(rootFileResource, 'snippets', 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.$bg)(e[0].resource, expected) && e[0].type === 1 /* FileChangeType.ADDED */) {
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
            const expected = (0, resources_1.$ig)(rootUserDataResource, 'snippets', 'settings.json');
            const target = (0, resources_1.$ig)(rootFileResource, 'snippets', 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.$bg)(e[0].resource, expected) && e[0].type === 0 /* FileChangeType.UPDATED */) {
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
            const expected = (0, resources_1.$ig)(rootUserDataResource, 'snippets', 'settings.json');
            const target = (0, resources_1.$ig)(rootFileResource, 'snippets', 'settings.json');
            disposables.add(testObject.onDidChangeFile(e => {
                if ((0, resources_1.$bg)(e[0].resource, expected) && e[0].type === 2 /* FileChangeType.DELETED */) {
                    done();
                }
            }));
            fileEventEmitter.fire([{
                    resource: target,
                    type: 2 /* FileChangeType.DELETED */
                }]);
        });
        test('event is not triggered if not watched', async () => {
            const target = (0, resources_1.$ig)(rootFileResource, 'settings.json');
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
            const target = (0, resources_1.$ig)((0, resources_1.$hg)(rootFileResource), 'settings.json');
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
//# sourceMappingURL=fileUserDataProvider.test.js.map