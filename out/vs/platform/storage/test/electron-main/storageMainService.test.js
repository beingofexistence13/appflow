/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/environment/node/argv", "vs/platform/environment/node/environmentService", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/state/node/stateService", "vs/platform/storage/common/storage", "vs/platform/storage/electron-main/storageMainService", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/test/electron-main/workbenchTestServices", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert_1, network_1, resources_1, uri_1, uuid_1, argv_1, environmentService_1, fileService_1, log_1, product_1, stateService_1, storage_1, storageMainService_1, telemetry_1, uriIdentityService_1, userDataProfile_1, workbenchTestServices_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StorageMainService', function () {
        const disposables = new lifecycle_1.DisposableStore();
        const productService = { _serviceBrand: undefined, ...product_1.default };
        const inMemoryProfileRoot = uri_1.URI.file('/location').with({ scheme: network_1.Schemas.inMemory });
        const inMemoryProfile = {
            id: 'id',
            name: 'inMemory',
            shortName: 'inMemory',
            isDefault: false,
            location: inMemoryProfileRoot,
            globalStorageHome: (0, resources_1.joinPath)(inMemoryProfileRoot, 'globalStorageHome'),
            settingsResource: (0, resources_1.joinPath)(inMemoryProfileRoot, 'settingsResource'),
            keybindingsResource: (0, resources_1.joinPath)(inMemoryProfileRoot, 'keybindingsResource'),
            tasksResource: (0, resources_1.joinPath)(inMemoryProfileRoot, 'tasksResource'),
            snippetsHome: (0, resources_1.joinPath)(inMemoryProfileRoot, 'snippetsHome'),
            extensionsResource: (0, resources_1.joinPath)(inMemoryProfileRoot, 'extensionsResource'),
            cacheHome: (0, resources_1.joinPath)(inMemoryProfileRoot, 'cache'),
        };
        class TestStorageMainService extends storageMainService_1.StorageMainService {
            getStorageOptions() {
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
                (0, assert_1.strictEqual)(typeof storage.get(telemetry_1.firstSessionDateStorageKey), 'string');
                (0, assert_1.strictEqual)(typeof storage.get(telemetry_1.currentSessionDateStorageKey), 'string');
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
            (0, assert_1.strictEqual)(storage.get(storage_1.IS_NEW_KEY), 'true');
            // Close
            await storage.close();
            (0, assert_1.strictEqual)(storageDidClose, true);
        }
        teardown(() => {
            disposables.clear();
        });
        function createStorageService(lifecycleMainService = new workbenchTestServices_1.TestLifecycleMainService()) {
            const environmentService = new environmentService_1.NativeEnvironmentService((0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS), productService);
            const fileService = disposables.add(new fileService_1.FileService(new log_1.NullLogService()));
            const uriIdentityService = disposables.add(new uriIdentityService_1.UriIdentityService(fileService));
            const testStorageService = disposables.add(new TestStorageMainService(new log_1.NullLogService(), environmentService, disposables.add(new userDataProfile_1.UserDataProfilesMainService(disposables.add(new stateService_1.StateService(1 /* SaveStrategy.DELAYED */, environmentService, new log_1.NullLogService(), fileService)), disposables.add(uriIdentityService), environmentService, fileService, new log_1.NullLogService())), lifecycleMainService, fileService, uriIdentityService));
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
            const workspace = { id: (0, uuid_1.generateUuid)() };
            const storageMainService = createStorageService();
            return testStorage(storageMainService.workspaceStorage(workspace), 1 /* StorageScope.WORKSPACE */);
        });
        test('storage closed onWillShutdown', async function () {
            const lifecycleMainService = new workbenchTestServices_1.TestLifecycleMainService();
            const storageMainService = createStorageService(lifecycleMainService);
            const profile = inMemoryProfile;
            const workspace = { id: (0, uuid_1.generateUuid)() };
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
            const workspace = { id: (0, uuid_1.generateUuid)() };
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
            const workspace = { id: (0, uuid_1.generateUuid)() };
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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZU1haW5TZXJ2aWNlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9zdG9yYWdlL3Rlc3QvZWxlY3Ryb24tbWFpbi9zdG9yYWdlTWFpblNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQTBCaEcsS0FBSyxDQUFDLG9CQUFvQixFQUFFO1FBRTNCLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBRTFDLE1BQU0sY0FBYyxHQUFvQixFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsR0FBRyxpQkFBTyxFQUFFLENBQUM7UUFFakYsTUFBTSxtQkFBbUIsR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDckYsTUFBTSxlQUFlLEdBQXFCO1lBQ3pDLEVBQUUsRUFBRSxJQUFJO1lBQ1IsSUFBSSxFQUFFLFVBQVU7WUFDaEIsU0FBUyxFQUFFLFVBQVU7WUFDckIsU0FBUyxFQUFFLEtBQUs7WUFDaEIsUUFBUSxFQUFFLG1CQUFtQjtZQUM3QixpQkFBaUIsRUFBRSxJQUFBLG9CQUFRLEVBQUMsbUJBQW1CLEVBQUUsbUJBQW1CLENBQUM7WUFDckUsZ0JBQWdCLEVBQUUsSUFBQSxvQkFBUSxFQUFDLG1CQUFtQixFQUFFLGtCQUFrQixDQUFDO1lBQ25FLG1CQUFtQixFQUFFLElBQUEsb0JBQVEsRUFBQyxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQztZQUN6RSxhQUFhLEVBQUUsSUFBQSxvQkFBUSxFQUFDLG1CQUFtQixFQUFFLGVBQWUsQ0FBQztZQUM3RCxZQUFZLEVBQUUsSUFBQSxvQkFBUSxFQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQztZQUMzRCxrQkFBa0IsRUFBRSxJQUFBLG9CQUFRLEVBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUM7WUFDdkUsU0FBUyxFQUFFLElBQUEsb0JBQVEsRUFBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUM7U0FDakQsQ0FBQztRQUVGLE1BQU0sc0JBQXVCLFNBQVEsdUNBQWtCO1lBRW5DLGlCQUFpQjtnQkFDbkMsT0FBTztvQkFDTixrQkFBa0IsRUFBRSxJQUFJO2lCQUN4QixDQUFDO1lBQ0gsQ0FBQztTQUNEO1FBRUQsS0FBSyxVQUFVLFdBQVcsQ0FBQyxPQUFxQixFQUFFLEtBQW1CO1lBQ3BFLElBQUEsb0JBQVcsRUFBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFeEMsOERBQThEO1lBQzlELElBQUksS0FBSyxzQ0FBNkIsRUFBRTtnQkFDdkMsSUFBQSxvQkFBVyxFQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDckIsSUFBQSxvQkFBVyxFQUFDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBMEIsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUN0RSxJQUFBLG9CQUFXLEVBQUMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUE0QixDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDeEU7aUJBQU07Z0JBQ04sTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDckI7WUFFRCxJQUFJLGtCQUFrQixHQUFvQyxTQUFTLENBQUM7WUFDcEUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzlDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzVCLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXpFLHlCQUF5QjtZQUN6QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztZQUVoQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxQixJQUFBLG9CQUFXLEVBQUMsa0JBQW1CLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWhDLElBQUEsb0JBQVcsRUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLElBQUEsb0JBQVcsRUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVDLElBQUEsb0JBQVcsRUFBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRS9DLElBQUEsb0JBQVcsRUFBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFMUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QixJQUFBLG9CQUFXLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUUzQyxJQUFBLG9CQUFXLEVBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTFDLFNBQVM7WUFDVCxJQUFBLG9CQUFXLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBVSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFN0MsUUFBUTtZQUNSLE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRXRCLElBQUEsb0JBQVcsRUFBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCxTQUFTLG9CQUFvQixDQUFDLHVCQUE4QyxJQUFJLGdEQUF3QixFQUFFO1lBQ3pHLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSw2Q0FBd0IsQ0FBQyxJQUFBLGdCQUFTLEVBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxjQUFPLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUMxRyxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUkseUJBQVcsQ0FBQyxJQUFJLG9CQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0UsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksdUNBQWtCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNoRixNQUFNLGtCQUFrQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLG9CQUFjLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksNkNBQTJCLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLDJCQUFZLCtCQUF1QixrQkFBa0IsRUFBRSxJQUFJLG9CQUFjLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQyxFQUFFLG9CQUFvQixFQUFFLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFFdGEsV0FBVyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBRXZELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVELElBQUksQ0FBQyxzQkFBc0IsRUFBRTtZQUM1QixNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixFQUFFLENBQUM7WUFFbEQsT0FBTyxXQUFXLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLG9DQUEyQixDQUFDO1FBQ3JGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3hCLE1BQU0sa0JBQWtCLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztZQUNsRCxNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUM7WUFFaEMsT0FBTyxXQUFXLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQywrQkFBdUIsQ0FBQztRQUN0RixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUMxQixNQUFNLFNBQVMsR0FBRyxFQUFFLEVBQUUsRUFBRSxJQUFBLG1CQUFZLEdBQUUsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sa0JBQWtCLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztZQUVsRCxPQUFPLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsaUNBQXlCLENBQUM7UUFDNUYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsK0JBQStCLEVBQUUsS0FBSztZQUMxQyxNQUFNLG9CQUFvQixHQUFHLElBQUksZ0RBQXdCLEVBQUUsQ0FBQztZQUM1RCxNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFdEUsTUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUEsbUJBQVksR0FBRSxFQUFFLENBQUM7WUFFekMsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4RSxJQUFJLHdCQUF3QixHQUFHLEtBQUssQ0FBQztZQUNyQyxXQUFXLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDdkQsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEUsSUFBSSxzQkFBc0IsR0FBRyxLQUFLLENBQUM7WUFDbkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO2dCQUNyRCxzQkFBc0IsR0FBRyxJQUFJLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0sa0JBQWtCLEdBQUcsa0JBQWtCLENBQUMsa0JBQWtCLENBQUM7WUFDakUsSUFBSSwwQkFBMEIsR0FBRyxLQUFLLENBQUM7WUFDdkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pELDBCQUEwQixHQUFHLElBQUksQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBQSxvQkFBVyxFQUFDLGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxzQ0FBc0M7WUFDOUcsSUFBQSxvQkFBVyxFQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLHNDQUFzQztZQUMvRyxJQUFBLG9CQUFXLEVBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLHNDQUFzQztZQUVySCxNQUFNLGtCQUFrQixDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hDLE1BQU0sY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzVCLE1BQU0sZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFOUIsTUFBTSxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBRWhELElBQUEsb0JBQVcsRUFBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5QyxJQUFBLG9CQUFXLEVBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUMsSUFBQSxvQkFBVyxFQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTVDLE1BQU0sZUFBZSxHQUFHLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuRSxJQUFBLHVCQUFjLEVBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBRWhELE1BQU0saUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekUsSUFBQSx1QkFBYyxFQUFDLGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFFcEQsTUFBTSxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLO1lBQzdDLE1BQU0sa0JBQWtCLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQztZQUNsRCxNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUM7WUFDaEMsTUFBTSxTQUFTLEdBQUcsRUFBRSxFQUFFLEVBQUUsSUFBQSxtQkFBWSxHQUFFLEVBQUUsQ0FBQztZQUV6QyxNQUFNLGdCQUFnQixHQUFHLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hFLElBQUksd0JBQXdCLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLFdBQVcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO2dCQUN2RCx3QkFBd0IsR0FBRyxJQUFJLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsRSxJQUFJLHNCQUFzQixHQUFHLEtBQUssQ0FBQztZQUNuQyxXQUFXLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3JELHNCQUFzQixHQUFHLElBQUksQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQztZQUNqRSxJQUFJLDBCQUEwQixHQUFHLEtBQUssQ0FBQztZQUN2QyxXQUFXLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDekQsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pDLE1BQU0sY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzdCLE1BQU0sZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFL0IsSUFBQSxvQkFBVyxFQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlDLElBQUEsb0JBQVcsRUFBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQyxJQUFBLG9CQUFXLEVBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMseUNBQXlDLEVBQUUsS0FBSztZQUNwRCxNQUFNLGtCQUFrQixHQUFHLG9CQUFvQixFQUFFLENBQUM7WUFDbEQsTUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDO1lBQ2hDLE1BQU0sU0FBUyxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUEsbUJBQVksR0FBRSxFQUFFLENBQUM7WUFFekMsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4RSxJQUFJLHdCQUF3QixHQUFHLEtBQUssQ0FBQztZQUNyQyxXQUFXLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDdkQsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEUsSUFBSSxzQkFBc0IsR0FBRyxLQUFLLENBQUM7WUFDbkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO2dCQUNyRCxzQkFBc0IsR0FBRyxJQUFJLENBQUM7WUFDL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE1BQU0saUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsa0JBQWtCLENBQUM7WUFDaEUsSUFBSSwwQkFBMEIsR0FBRyxLQUFLLENBQUM7WUFDdkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3hELDBCQUEwQixHQUFHLElBQUksQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3RCLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO1lBRXhCLE1BQU0saUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEMsTUFBTSxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0IsTUFBTSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUUvQixJQUFBLG9CQUFXLEVBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUMsSUFBQSxvQkFBVyxFQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFDLElBQUEsb0JBQVcsRUFBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUEsK0NBQXVDLEdBQUUsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQyJ9