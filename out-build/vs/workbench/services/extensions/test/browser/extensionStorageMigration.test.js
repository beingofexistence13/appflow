/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/log/common/log", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/extensionManagement/common/extensionStorage", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/buffer", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/services/extensions/common/extensionStorageMigration", "vs/platform/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfileService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/test/common/utils"], function (require, exports, assert, environment_1, files_1, fileService_1, inMemoryFilesystemProvider_1, log_1, workbenchTestServices_1, extensionStorage_1, uri_1, resources_1, buffer_1, testWorkspace_1, extensionStorageMigration_1, storage_1, userDataProfile_1, userDataProfileService_1, userDataProfile_2, uriIdentityService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionStorageMigration', () => {
        const disposables = (0, utils_1.$bT)();
        const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
        const workspaceStorageHome = (0, resources_1.$ig)(ROOT, 'workspaceStorageHome');
        let instantiationService;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            const fileService = disposables.add(new fileService_1.$Dp(new log_1.$fj()));
            disposables.add(fileService.registerProvider(ROOT.scheme, disposables.add(new inMemoryFilesystemProvider_1.$rAb())));
            instantiationService.stub(files_1.$6j, fileService);
            const environmentService = instantiationService.stub(environment_1.$Ih, { userRoamingDataHome: ROOT, workspaceStorageHome, cacheHome: ROOT });
            const userDataProfilesService = instantiationService.stub(userDataProfile_1.$Ek, disposables.add(new userDataProfile_1.$Hk(environmentService, fileService, disposables.add(new uriIdentityService_1.$pr(fileService)), new log_1.$fj())));
            instantiationService.stub(userDataProfile_2.$CJ, disposables.add(new userDataProfileService_1.$I2b(userDataProfilesService.defaultProfile)));
            instantiationService.stub(extensionStorage_1.$Tz, disposables.add(instantiationService.createInstance(extensionStorage_1.$Uz)));
        });
        test('migrate extension storage', async () => {
            const fromExtensionId = 'pub.from', toExtensionId = 'pub.to', storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
            const extensionStorageService = instantiationService.get(extensionStorage_1.$Tz), fileService = instantiationService.get(files_1.$6j), storageService = instantiationService.get(storage_1.$Vo), userDataProfilesService = instantiationService.get(userDataProfile_1.$Ek);
            extensionStorageService.setExtensionState(fromExtensionId, { globalKey: 'hello global state' }, true);
            extensionStorageService.setExtensionState(fromExtensionId, { workspaceKey: 'hello workspace state' }, false);
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.globalStorageHome, fromExtensionId), buffer_1.$Fd.fromString('hello global storage'));
            await fileService.writeFile((0, resources_1.$ig)(workspaceStorageHome, testWorkspace_1.$$0b.id, fromExtensionId), buffer_1.$Fd.fromString('hello workspace storage'));
            await (0, extensionStorageMigration_1.$Pkb)(fromExtensionId, toExtensionId, true, instantiationService);
            await (0, extensionStorageMigration_1.$Pkb)(fromExtensionId, toExtensionId, false, instantiationService);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(fromExtensionId, true), undefined);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(fromExtensionId, false), undefined);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.$ig)(userDataProfilesService.defaultProfile.globalStorageHome, fromExtensionId))), false);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.$ig)(workspaceStorageHome, testWorkspace_1.$$0b.id, fromExtensionId))), false);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(toExtensionId, true), { globalKey: 'hello global state' });
            assert.deepStrictEqual(extensionStorageService.getExtensionState(toExtensionId, false), { workspaceKey: 'hello workspace state' });
            assert.deepStrictEqual((await fileService.readFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.globalStorageHome, toExtensionId))).value.toString(), 'hello global storage');
            assert.deepStrictEqual((await fileService.readFile((0, resources_1.$ig)(workspaceStorageHome, testWorkspace_1.$$0b.id, toExtensionId))).value.toString(), 'hello workspace storage');
            assert.deepStrictEqual(storageService.get(storageMigratedKey, 0 /* StorageScope.PROFILE */), 'true');
            assert.deepStrictEqual(storageService.get(storageMigratedKey, 1 /* StorageScope.WORKSPACE */), 'true');
        });
        test('migrate extension storage when does not exist', async () => {
            const fromExtensionId = 'pub.from', toExtensionId = 'pub.to', storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
            const extensionStorageService = instantiationService.get(extensionStorage_1.$Tz), fileService = instantiationService.get(files_1.$6j), storageService = instantiationService.get(storage_1.$Vo), userDataProfilesService = instantiationService.get(userDataProfile_1.$Ek);
            await (0, extensionStorageMigration_1.$Pkb)(fromExtensionId, toExtensionId, true, instantiationService);
            await (0, extensionStorageMigration_1.$Pkb)(fromExtensionId, toExtensionId, false, instantiationService);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(fromExtensionId, true), undefined);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(fromExtensionId, false), undefined);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.$ig)(userDataProfilesService.defaultProfile.globalStorageHome, fromExtensionId))), false);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.$ig)(workspaceStorageHome, testWorkspace_1.$$0b.id, fromExtensionId))), false);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(toExtensionId, true), undefined);
            assert.deepStrictEqual(extensionStorageService.getExtensionState(toExtensionId, false), undefined);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.$ig)(userDataProfilesService.defaultProfile.globalStorageHome, toExtensionId))), false);
            assert.deepStrictEqual((await fileService.exists((0, resources_1.$ig)(workspaceStorageHome, testWorkspace_1.$$0b.id, toExtensionId))), false);
            assert.deepStrictEqual(storageService.get(storageMigratedKey, 0 /* StorageScope.PROFILE */), 'true');
            assert.deepStrictEqual(storageService.get(storageMigratedKey, 1 /* StorageScope.WORKSPACE */), 'true');
        });
    });
});
//# sourceMappingURL=extensionStorageMigration.test.js.map