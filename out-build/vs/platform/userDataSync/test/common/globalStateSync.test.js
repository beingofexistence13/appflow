/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/test/common/timeTravelScheduler", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/userDataSync/test/common/userDataSyncClient", "vs/base/test/common/utils"], function (require, exports, assert, buffer_1, timeTravelScheduler_1, environment_1, files_1, storage_1, userDataProfile_1, userDataSync_1, userDataProfileStorageService_1, userDataSyncClient_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('GlobalStateSync', () => {
        const server = new userDataSyncClient_1.$X$b();
        let testClient;
        let client2;
        let testObject;
        teardown(async () => {
            await testClient.instantiationService.get(userDataSync_1.$Fgb).clear();
        });
        const disposableStore = (0, utils_1.$bT)();
        setup(async () => {
            testClient = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await testClient.setUp(true);
            testObject = testClient.getSynchronizer("globalState" /* SyncResource.GlobalState */);
            client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
        });
        test('when global state does not exist', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            assert.deepStrictEqual(await testObject.getLastSyncUserData(), null);
            let manifest = await testClient.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, [
                { type: 'GET', url: `${server.url}/v1/resource/${testObject.resource}/latest`, headers: {} },
            ]);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.deepStrictEqual(lastSyncUserData.ref, remoteUserData.ref);
            assert.deepStrictEqual(lastSyncUserData.syncData, remoteUserData.syncData);
            assert.strictEqual(lastSyncUserData.syncData, null);
            manifest = await testClient.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, []);
            manifest = await testClient.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, []);
        }));
        test('when global state is created after first sync', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            await testObject.sync(await testClient.getResourceManifest());
            updateUserStorage('a', 'value1', testClient);
            let lastSyncUserData = await testObject.getLastSyncUserData();
            const manifest = await testClient.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, [
                { type: 'POST', url: `${server.url}/v1/resource/${testObject.resource}`, headers: { 'If-Match': lastSyncUserData?.ref } },
            ]);
            lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.deepStrictEqual(lastSyncUserData.ref, remoteUserData.ref);
            assert.deepStrictEqual(lastSyncUserData.syncData, remoteUserData.syncData);
            assert.deepStrictEqual(JSON.parse(lastSyncUserData.syncData.content).storage, { 'a': { version: 1, value: 'value1' } });
        }));
        test('first time sync - outgoing to server (no state)', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            updateUserStorage('a', 'value1', testClient);
            updateMachineStorage('b', 'value1', testClient);
            await updateLocale(testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseGlobalState(content);
            assert.deepStrictEqual(actual.storage, { 'globalState.argv.locale': { version: 1, value: 'en' }, 'a': { version: 1, value: 'value1' } });
        }));
        test('first time sync - incoming from server (no state)', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            updateUserStorage('a', 'value1', client2);
            await updateLocale(client2);
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            assert.strictEqual(readStorage('a', testClient), 'value1');
            assert.strictEqual(await readLocale(testClient), 'en');
        }));
        test('first time sync when storage exists', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            updateUserStorage('a', 'value1', client2);
            await client2.sync();
            updateUserStorage('b', 'value2', testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            assert.strictEqual(readStorage('a', testClient), 'value1');
            assert.strictEqual(readStorage('b', testClient), 'value2');
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseGlobalState(content);
            assert.deepStrictEqual(actual.storage, { 'a': { version: 1, value: 'value1' }, 'b': { version: 1, value: 'value2' } });
        }));
        test('first time sync when storage exists - has conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            updateUserStorage('a', 'value1', client2);
            await client2.sync();
            updateUserStorage('a', 'value2', client2);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            assert.strictEqual(readStorage('a', testClient), 'value1');
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseGlobalState(content);
            assert.deepStrictEqual(actual.storage, { 'a': { version: 1, value: 'value1' } });
        }));
        test('sync adding a storage value', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            updateUserStorage('a', 'value1', testClient);
            await testObject.sync(await testClient.getResourceManifest());
            updateUserStorage('b', 'value2', testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            assert.strictEqual(readStorage('a', testClient), 'value1');
            assert.strictEqual(readStorage('b', testClient), 'value2');
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseGlobalState(content);
            assert.deepStrictEqual(actual.storage, { 'a': { version: 1, value: 'value1' }, 'b': { version: 1, value: 'value2' } });
        }));
        test('sync updating a storage value', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            updateUserStorage('a', 'value1', testClient);
            await testObject.sync(await testClient.getResourceManifest());
            updateUserStorage('a', 'value2', testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            assert.strictEqual(readStorage('a', testClient), 'value2');
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseGlobalState(content);
            assert.deepStrictEqual(actual.storage, { 'a': { version: 1, value: 'value2' } });
        }));
        test('sync removing a storage value', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            updateUserStorage('a', 'value1', testClient);
            updateUserStorage('b', 'value2', testClient);
            await testObject.sync(await testClient.getResourceManifest());
            removeStorage('b', testClient);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            assert.strictEqual(readStorage('a', testClient), 'value1');
            assert.strictEqual(readStorage('b', testClient), undefined);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseGlobalState(content);
            assert.deepStrictEqual(actual.storage, { 'a': { version: 1, value: 'value1' } });
        }));
        test('sync profile state', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const profile = await client2.instantiationService.get(userDataProfile_1.$Ek).createNamedProfile('profile1');
            await updateLocale(client2);
            await updateUserStorageForProfile('a', 'value1', profile, testClient);
            await client2.sync();
            await testClient.sync();
            const syncedProfile = testClient.instantiationService.get(userDataProfile_1.$Ek).profiles.find(p => p.id === profile.id);
            const profileStorage = await testClient.instantiationService.get(userDataProfileStorageService_1.$eAb).readStorageData(syncedProfile);
            assert.strictEqual(profileStorage.get('a')?.value, 'value1');
            assert.strictEqual(await readLocale(testClient), 'en');
            const { content } = await testClient.read(testObject.resource, '1');
            assert.ok(content !== null);
            const actual = parseGlobalState(content);
            assert.deepStrictEqual(actual.storage, { 'a': { version: 1, value: 'value1' } });
        }));
        function parseGlobalState(content) {
            const syncData = JSON.parse(content);
            return JSON.parse(syncData.content);
        }
        async function updateLocale(client) {
            const fileService = client.instantiationService.get(files_1.$6j);
            const environmentService = client.instantiationService.get(environment_1.$Ih);
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'en' })));
        }
        function updateUserStorage(key, value, client, profile) {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            storageService.store(key, value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        async function updateUserStorageForProfile(key, value, profile, client) {
            const storageService = client.instantiationService.get(userDataProfileStorageService_1.$eAb);
            const data = new Map();
            data.set(key, value);
            await storageService.updateStorageData(profile, data, 0 /* StorageTarget.USER */);
        }
        function updateMachineStorage(key, value, client) {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            storageService.store(key, value, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        function removeStorage(key, client) {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            storageService.remove(key, 0 /* StorageScope.PROFILE */);
        }
        function readStorage(key, client) {
            const storageService = client.instantiationService.get(storage_1.$Vo);
            return storageService.get(key, 0 /* StorageScope.PROFILE */);
        }
        async function readLocale(client) {
            const fileService = client.instantiationService.get(files_1.$6j);
            const environmentService = client.instantiationService.get(environment_1.$Ih);
            const content = await fileService.readFile(environmentService.argvResource);
            return JSON.parse(content.value.toString()).locale;
        }
    });
});
//# sourceMappingURL=globalStateSync.test.js.map