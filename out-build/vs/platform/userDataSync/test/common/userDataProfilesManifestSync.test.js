/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/test/common/userDataSyncClient"], function (require, exports, assert, utils_1, userDataProfile_1, userDataSync_1, userDataSyncClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('UserDataProfilesManifestSync', () => {
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
            testObject = testClient.getSynchronizer("profiles" /* SyncResource.Profiles */);
            client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
        });
        test('when profiles does not exist', async () => {
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
        });
        test('when profile is created after first sync', async () => {
            await testObject.sync(await testClient.getResourceManifest());
            await testClient.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', '1');
            let lastSyncUserData = await testObject.getLastSyncUserData();
            const manifest = await testClient.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, [
                { type: 'POST', url: `${server.url}/v1/collection`, headers: {} },
                { type: 'POST', url: `${server.url}/v1/resource/${testObject.resource}`, headers: { 'If-Match': lastSyncUserData?.ref } },
            ]);
            lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.deepStrictEqual(lastSyncUserData.ref, remoteUserData.ref);
            assert.deepStrictEqual(lastSyncUserData.syncData, remoteUserData.syncData);
            assert.deepStrictEqual(JSON.parse(lastSyncUserData.syncData.content), [{ 'name': '1', 'id': '1', 'collection': '1' }]);
        });
        test('first time sync - outgoing to server (no state)', async () => {
            await testClient.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', '1');
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            assert.deepStrictEqual(JSON.parse(JSON.parse(content).content), [{ 'name': '1', 'id': '1', 'collection': '1' }]);
        });
        test('first time sync - incoming from server (no state)', async () => {
            await client2.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 1');
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const profiles = getLocalProfiles(testClient);
            assert.deepStrictEqual(profiles, [{ id: '1', name: 'name 1', shortName: undefined, useDefaultFlags: undefined }]);
        });
        test('first time sync when profiles exists', async () => {
            await client2.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 1');
            await client2.sync();
            await testClient.instantiationService.get(userDataProfile_1.$Ek).createProfile('2', 'name 2');
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const profiles = getLocalProfiles(testClient);
            assert.deepStrictEqual(profiles, [{ id: '1', name: 'name 1', shortName: undefined, useDefaultFlags: undefined }, { id: '2', name: 'name 2', shortName: undefined, useDefaultFlags: undefined }]);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseRemoteProfiles(content);
            assert.deepStrictEqual(actual, [{ id: '1', name: 'name 1', collection: '1' }, { id: '2', name: 'name 2', collection: '2' }]);
        });
        test('first time sync when storage exists - has conflicts', async () => {
            await client2.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 1');
            await client2.sync();
            await testClient.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 2');
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const profiles = getLocalProfiles(testClient);
            assert.deepStrictEqual(profiles, [{ id: '1', name: 'name 1', shortName: undefined, useDefaultFlags: undefined }]);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseRemoteProfiles(content);
            assert.deepStrictEqual(actual, [{ id: '1', name: 'name 1', collection: '1' }]);
        });
        test('sync adding a profile', async () => {
            await testClient.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 1', { shortName: 'short 1' });
            await testObject.sync(await testClient.getResourceManifest());
            await client2.sync();
            await testClient.instantiationService.get(userDataProfile_1.$Ek).createProfile('2', 'name 2');
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            assert.deepStrictEqual(getLocalProfiles(testClient), [{ id: '1', name: 'name 1', shortName: 'short 1', useDefaultFlags: undefined }, { id: '2', name: 'name 2', shortName: undefined, useDefaultFlags: undefined }]);
            await client2.sync();
            assert.deepStrictEqual(getLocalProfiles(client2), [{ id: '1', name: 'name 1', shortName: 'short 1', useDefaultFlags: undefined }, { id: '2', name: 'name 2', shortName: undefined, useDefaultFlags: undefined }]);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseRemoteProfiles(content);
            assert.deepStrictEqual(actual, [{ id: '1', name: 'name 1', collection: '1', shortName: 'short 1' }, { id: '2', name: 'name 2', collection: '2' }]);
        });
        test('sync updating a profile', async () => {
            const profile = await testClient.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 1');
            await testObject.sync(await testClient.getResourceManifest());
            await client2.sync();
            await testClient.instantiationService.get(userDataProfile_1.$Ek).updateProfile(profile, { name: 'name 2', shortName: '2' });
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            assert.deepStrictEqual(getLocalProfiles(testClient), [{ id: '1', name: 'name 2', shortName: '2', useDefaultFlags: undefined }]);
            await client2.sync();
            assert.deepStrictEqual(getLocalProfiles(client2), [{ id: '1', name: 'name 2', shortName: '2', useDefaultFlags: undefined }]);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseRemoteProfiles(content);
            assert.deepStrictEqual(actual, [{ id: '1', name: 'name 2', collection: '1', shortName: '2' }]);
        });
        test('sync removing a profile', async () => {
            const profile = await testClient.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 1');
            await testClient.instantiationService.get(userDataProfile_1.$Ek).createProfile('2', 'name 2');
            await testObject.sync(await testClient.getResourceManifest());
            await client2.sync();
            testClient.instantiationService.get(userDataProfile_1.$Ek).removeProfile(profile);
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            assert.deepStrictEqual(getLocalProfiles(testClient), [{ id: '2', name: 'name 2', shortName: undefined, useDefaultFlags: undefined }]);
            await client2.sync();
            assert.deepStrictEqual(getLocalProfiles(client2), [{ id: '2', name: 'name 2', shortName: undefined, useDefaultFlags: undefined }]);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseRemoteProfiles(content);
            assert.deepStrictEqual(actual, [{ id: '2', name: 'name 2', collection: '2' }]);
        });
        test('sync profile that uses default profile', async () => {
            await client2.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 1', { useDefaultFlags: { keybindings: true } });
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseRemoteProfiles(content);
            assert.deepStrictEqual(actual, [{ id: '1', name: 'name 1', collection: '1', useDefaultFlags: { keybindings: true } }]);
            assert.deepStrictEqual(getLocalProfiles(testClient), [{ id: '1', name: 'name 1', shortName: undefined, useDefaultFlags: { keybindings: true } }]);
        });
        test('sync profile when the profile is updated to use default profile locally', async () => {
            await client2.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 1');
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            const profile = testClient.instantiationService.get(userDataProfile_1.$Ek).profiles.find(p => p.id === '1');
            testClient.instantiationService.get(userDataProfile_1.$Ek).updateProfile(profile, { useDefaultFlags: { keybindings: true } });
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseRemoteProfiles(content);
            assert.deepStrictEqual(actual, [{ id: '1', name: 'name 1', collection: '1', useDefaultFlags: { keybindings: true } }]);
            assert.deepStrictEqual(getLocalProfiles(testClient), [{ id: '1', name: 'name 1', shortName: undefined, useDefaultFlags: { keybindings: true } }]);
        });
        test('sync profile when the profile is updated to use default profile remotely', async () => {
            const profile = await client2.instantiationService.get(userDataProfile_1.$Ek).createProfile('1', 'name 1');
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            client2.instantiationService.get(userDataProfile_1.$Ek).updateProfile(profile, { useDefaultFlags: { keybindings: true } });
            await client2.sync();
            await testObject.sync(await testClient.getResourceManifest());
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts.conflicts, []);
            const { content } = await testClient.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseRemoteProfiles(content);
            assert.deepStrictEqual(actual, [{ id: '1', name: 'name 1', collection: '1', useDefaultFlags: { keybindings: true } }]);
            assert.deepStrictEqual(getLocalProfiles(testClient), [{ id: '1', name: 'name 1', shortName: undefined, useDefaultFlags: { keybindings: true } }]);
        });
        function parseRemoteProfiles(content) {
            const syncData = JSON.parse(content);
            return JSON.parse(syncData.content);
        }
        function getLocalProfiles(client) {
            return client.instantiationService.get(userDataProfile_1.$Ek).profiles
                .slice(1).sort((a, b) => a.name.localeCompare(b.name))
                .map(profile => ({ id: profile.id, name: profile.name, shortName: profile.shortName, useDefaultFlags: profile.useDefaultFlags }));
        }
    });
});
//# sourceMappingURL=userDataProfilesManifestSync.test.js.map