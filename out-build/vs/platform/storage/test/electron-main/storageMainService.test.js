/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/environment/node/argv", "vs/platform/environment/node/environmentService", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/state/node/stateService", "vs/platform/storage/common/storage", "vs/platform/storage/electron-main/storageMainService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/test/electron-main/workbenchTestServices", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert_1, network_1, resources_1, uri_1, uuid_1, argv_1, environmentService_1, fileService_1, log_1, product_1, stateService_1, storage_1, storageMainService_1, telemetry_1, uriIdentityService_1, userDataProfile_1, workbenchTestServices_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StorageMainService', function () {
        const disposables = new lifecycle_1.$jc();
        const productService = { _serviceBrand: undefined, ...product_1.default };
        const inMemoryProfileRoot = uri_1.URI.file('/location').with({ scheme: network_1.Schemas.inMemory });
        const inMemoryProfile = {
            id: 'id',
            name: 'inMemory',
            shortName: 'inMemory',
            isDefault: false,
            location: inMemoryProfileRoot,
            globalStorageHome: (0, resources_1.$ig)(inMemoryProfileRoot, 'globalStorageHome'),
            settingsResource: (0, resources_1.$ig)(inMemoryProfileRoot, 'settingsResource'),
            keybindingsResource: (0, resources_1.$ig)(inMemoryProfileRoot, 'keybindingsResource'),
            tasksResource: (0, resources_1.$ig)(inMemoryProfileRoot, 'tasksResource'),
            snippetsHome: (0, resources_1.$ig)(inMemoryProfileRoot, 'snippetsHome'),
            extensionsResource: (0, resources_1.$ig)(inMemoryProfileRoot, 'extensionsResource'),
            cacheHome: (0, resources_1.$ig)(inMemoryProfileRoot, 'cache'),
        };
        class TestStorageMainService extends storageMainService_1.$y5b {
            n() {
                return {
                    useInMemoryStorage: true
                };
            }
        }
        async function testStorage(storage, scope) {
            (0, assert_1.strictEqual)(storage.isInMemory(), true);
            // Telemetry: added after init unless workspace/profile scoped
            if (scope === -1 /* StorageScope.APPLICATION */) {
                (0, assert_1.strictEqual)(storage.items.size, 0);
                await storage.init();
                (0, assert_1.strictEqual)(typeof storage.get(telemetry_1.$_k), 'string');
                (0, assert_1.strictEqual)(typeof storage.get(telemetry_1.$$k), 'string');
            }
            else {
                await storage.init();
            }
            let storageChangeEvent = undefined;
            disposables.add(storage.onDidChangeStorage(e => {
                storageChangeEvent = e;
            }));
            let storageDidClose = false;
            disposables.add(storage.onDidCloseStorage(() => storageDidClose = true));
            // Basic store/get/remove
            const size = storage.items.size;
            storage.set('bar', 'foo');
            (0, assert_1.strictEqual)(storageChangeEvent.key, 'bar');
            storage.set('barNumber', 55);
            storage.set('barBoolean', true);
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
            (0, assert_1.strictEqual)(storage.get('barNumber'), '55');
            (0, assert_1.strictEqual)(storage.get('barBoolean'), 'true');
            (0, assert_1.strictEqual)(storage.items.size, size + 3);
            storage.delete('bar');
            (0, assert_1.strictEqual)(storage.get('bar'), undefined);
            (0, assert_1.strictEqual)(storage.items.size, size + 2);
            // IS_NEW
            (0, assert_1.strictEqual)(storage.get(storage_1.$To), 'true');
            // Close
            await storage.close();
            (0, assert_1.strictEqual)(storageDidClose, true);
        }
        teardown(() => {
            disposables.clear();
        });
        function createStorageService(lifecycleMainService = new workbenchTestServices_1.$q$b()) {
            const environmentService = new environmentService_1.$_l((0, argv_1.$zl)(process.argv, argv_1.$yl), productService);
            const fileService = disposables.add(new fileService_1.$Dp(new log_1.$fj()));
            const uriIdentityService = disposables.add(new uriIdentityService_1.$pr(fileService));
            const testStorageService = disposables.add(new TestStorageMainService(new log_1.$fj(), environmentService, disposables.add(new userDataProfile_1.$w5b(disposables.add(new stateService_1.$hN(1 /* SaveStrategy.DELAYED */, environmentService, new log_1.$fj(), fileService)), disposables.add(uriIdentityService), environmentService, fileService, new log_1.$fj())), lifecycleMainService, fileService, uriIdentityService));
            disposables.add(testStorageService.applicationStorage);
            return testStorageService;
        }
        test('basics (application)', function () {
            const storageMainService = createStorageService();
            return testStorage(storageMainService.applicationStorage, -1 /* StorageScope.APPLICATION */);
        });
        test('basics (profile)', function () {
            const storageMainService = createStorageService();
            const profile = inMemoryProfile;
            return testStorage(storageMainService.profileStorage(profile), 0 /* StorageScope.PROFILE */);
        });
        test('basics (workspace)', function () {
            const workspace = { id: (0, uuid_1.$4f)() };
            const storageMainService = createStorageService();
            return testStorage(storageMainService.workspaceStorage(workspace), 1 /* StorageScope.WORKSPACE */);
        });
        test('storage closed onWillShutdown', async function () {
            const lifecycleMainService = new workbenchTestServices_1.$q$b();
            const storageMainService = createStorageService(lifecycleMainService);
            const profile = inMemoryProfile;
            const workspace = { id: (0, uuid_1.$4f)() };
            const workspaceStorage = storageMainService.workspaceStorage(workspace);
            let didCloseWorkspaceStorage = false;
            disposables.add(workspaceStorage.onDidCloseStorage(() => {
                didCloseWorkspaceStorage = true;
            }));
            const profileStorage = storageMainService.profileStorage(profile);
            let didCloseProfileStorage = false;
            disposables.add(profileStorage.onDidCloseStorage(() => {
                didCloseProfileStorage = true;
            }));
            const applicationStorage = storageMainService.applicationStorage;
            let didCloseApplicationStorage = false;
            disposables.add(applicationStorage.onDidCloseStorage(() => {
                didCloseApplicationStorage = true;
            }));
            (0, assert_1.strictEqual)(applicationStorage, storageMainService.applicationStorage); // same instance as long as not closed
            (0, assert_1.strictEqual)(profileStorage, storageMainService.profileStorage(profile)); // same instance as long as not closed
            (0, assert_1.strictEqual)(workspaceStorage, storageMainService.workspaceStorage(workspace)); // same instance as long as not closed
            await applicationStorage.init();
            await profileStorage.init();
            await workspaceStorage.init();
            await lifecycleMainService.fireOnWillShutdown();
            (0, assert_1.strictEqual)(didCloseApplicationStorage, true);
            (0, assert_1.strictEqual)(didCloseProfileStorage, true);
            (0, assert_1.strictEqual)(didCloseWorkspaceStorage, true);
            const profileStorage2 = storageMainService.profileStorage(profile);
            (0, assert_1.notStrictEqual)(profileStorage, profileStorage2);
            const workspaceStorage2 = storageMainService.workspaceStorage(workspace);
            (0, assert_1.notStrictEqual)(workspaceStorage, workspaceStorage2);
            await workspaceStorage2.close();
        });
        test('storage closed before init works', async function () {
            const storageMainService = createStorageService();
            const profile = inMemoryProfile;
            const workspace = { id: (0, uuid_1.$4f)() };
            const workspaceStorage = storageMainService.workspaceStorage(workspace);
            let didCloseWorkspaceStorage = false;
            disposables.add(workspaceStorage.onDidCloseStorage(() => {
                didCloseWorkspaceStorage = true;
            }));
            const profileStorage = storageMainService.profileStorage(profile);
            let didCloseProfileStorage = false;
            disposables.add(profileStorage.onDidCloseStorage(() => {
                didCloseProfileStorage = true;
            }));
            const applicationStorage = storageMainService.applicationStorage;
            let didCloseApplicationStorage = false;
            disposables.add(applicationStorage.onDidCloseStorage(() => {
                didCloseApplicationStorage = true;
            }));
            await applicationStorage.close();
            await profileStorage.close();
            await workspaceStorage.close();
            (0, assert_1.strictEqual)(didCloseApplicationStorage, true);
            (0, assert_1.strictEqual)(didCloseProfileStorage, true);
            (0, assert_1.strictEqual)(didCloseWorkspaceStorage, true);
        });
        test('storage closed before init awaits works', async function () {
            const storageMainService = createStorageService();
            const profile = inMemoryProfile;
            const workspace = { id: (0, uuid_1.$4f)() };
            const workspaceStorage = storageMainService.workspaceStorage(workspace);
            let didCloseWorkspaceStorage = false;
            disposables.add(workspaceStorage.onDidCloseStorage(() => {
                didCloseWorkspaceStorage = true;
            }));
            const profileStorage = storageMainService.profileStorage(profile);
            let didCloseProfileStorage = false;
            disposables.add(profileStorage.onDidCloseStorage(() => {
                didCloseProfileStorage = true;
            }));
            const applicationtorage = storageMainService.applicationStorage;
            let didCloseApplicationStorage = false;
            disposables.add(applicationtorage.onDidCloseStorage(() => {
                didCloseApplicationStorage = true;
            }));
            applicationtorage.init();
            profileStorage.init();
            workspaceStorage.init();
            await applicationtorage.close();
            await profileStorage.close();
            await workspaceStorage.close();
            (0, assert_1.strictEqual)(didCloseApplicationStorage, true);
            (0, assert_1.strictEqual)(didCloseProfileStorage, true);
            (0, assert_1.strictEqual)(didCloseWorkspaceStorage, true);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=storageMainService.test.js.map