/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/keybindingsSync", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/test/common/userDataSyncClient"], function (require, exports, assert, buffer_1, utils_1, files_1, log_1, userDataProfile_1, keybindingsSync_1, userDataSync_1, userDataSyncClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('KeybindingsSync', () => {
        const server = new userDataSyncClient_1.$X$b();
        let client;
        let testObject;
        teardown(async () => {
            await client.instantiationService.get(userDataSync_1.$Fgb).clear();
        });
        const disposableStore = (0, utils_1.$bT)();
        setup(async () => {
            client = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client.setUp(true);
            testObject = client.getSynchronizer("keybindings" /* SyncResource.Keybindings */);
        });
        test('when keybindings file does not exist', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const keybindingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource;
            assert.deepStrictEqual(await testObject.getLastSyncUserData(), null);
            let manifest = await client.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, [
                { type: 'GET', url: `${server.url}/v1/resource/${testObject.resource}/latest`, headers: {} },
            ]);
            assert.ok(!await fileService.exists(keybindingsResource));
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.deepStrictEqual(lastSyncUserData.ref, remoteUserData.ref);
            assert.deepStrictEqual(lastSyncUserData.syncData, remoteUserData.syncData);
            assert.strictEqual(lastSyncUserData.syncData, null);
            manifest = await client.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, []);
            manifest = await client.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, []);
        });
        test('when keybindings file is empty and remote has no changes', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const keybindingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource;
            await fileService.writeFile(keybindingsResource, buffer_1.$Fd.fromString(''));
            await testObject.sync(await client.getResourceManifest());
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(lastSyncUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), '[]');
            assert.strictEqual((0, keybindingsSync_1.$S2b)(remoteUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), '[]');
            assert.strictEqual((await fileService.readFile(keybindingsResource)).value.toString(), '');
        });
        test('when keybindings file is empty and remote has changes', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const content = JSON.stringify([
                {
                    'key': 'shift+cmd+w',
                    'command': 'workbench.action.closeAllEditors',
                }
            ]);
            await client2.instantiationService.get(files_1.$6j).writeFile(client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(content));
            await client2.sync();
            const fileService = client.instantiationService.get(files_1.$6j);
            const keybindingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource;
            await fileService.writeFile(keybindingsResource, buffer_1.$Fd.fromString(''));
            await testObject.sync(await client.getResourceManifest());
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(lastSyncUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(remoteUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(keybindingsResource)).value.toString(), content);
        });
        test('when keybindings file is empty with comment and remote has no changes', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const keybindingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource;
            const expectedContent = '// Empty Keybindings';
            await fileService.writeFile(keybindingsResource, buffer_1.$Fd.fromString(expectedContent));
            await testObject.sync(await client.getResourceManifest());
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(lastSyncUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), expectedContent);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(remoteUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), expectedContent);
            assert.strictEqual((await fileService.readFile(keybindingsResource)).value.toString(), expectedContent);
        });
        test('when keybindings file is empty and remote has keybindings', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const content = JSON.stringify([
                {
                    'key': 'shift+cmd+w',
                    'command': 'workbench.action.closeAllEditors',
                }
            ]);
            await client2.instantiationService.get(files_1.$6j).writeFile(client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(content));
            await client2.sync();
            const fileService = client.instantiationService.get(files_1.$6j);
            const keybindingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource;
            await fileService.writeFile(keybindingsResource, buffer_1.$Fd.fromString('// Empty Keybindings'));
            await testObject.sync(await client.getResourceManifest());
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(lastSyncUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(remoteUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(keybindingsResource)).value.toString(), content);
        });
        test('when keybindings file is empty and remote has empty array', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const content = `// Place your key bindings in this file to override the defaults
[
]`;
            await client2.instantiationService.get(files_1.$6j).writeFile(client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(content));
            await client2.sync();
            const fileService = client.instantiationService.get(files_1.$6j);
            const keybindingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource;
            const expectedLocalContent = '// Empty Keybindings';
            await fileService.writeFile(keybindingsResource, buffer_1.$Fd.fromString(expectedLocalContent));
            await testObject.sync(await client.getResourceManifest());
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(lastSyncUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(remoteUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(keybindingsResource)).value.toString(), expectedLocalContent);
        });
        test('when keybindings file is created after first sync', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const keybindingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource;
            await testObject.sync(await client.getResourceManifest());
            await fileService.createFile(keybindingsResource, buffer_1.$Fd.fromString('[]'));
            let lastSyncUserData = await testObject.getLastSyncUserData();
            const manifest = await client.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, [
                { type: 'POST', url: `${server.url}/v1/resource/${testObject.resource}`, headers: { 'If-Match': lastSyncUserData?.ref } },
            ]);
            lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.deepStrictEqual(lastSyncUserData.ref, remoteUserData.ref);
            assert.deepStrictEqual(lastSyncUserData.syncData, remoteUserData.syncData);
            assert.strictEqual((0, keybindingsSync_1.$S2b)(lastSyncUserData.syncData.content, true, client.instantiationService.get(log_1.$5i)), '[]');
        });
        test('test apply remote when keybindings file does not exist', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const keybindingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource;
            if (await fileService.exists(keybindingsResource)) {
                await fileService.del(keybindingsResource);
            }
            const preview = (await testObject.preview(await client.getResourceManifest(), {}));
            server.reset();
            const content = await testObject.resolveContent(preview.resourcePreviews[0].remoteResource);
            await testObject.accept(preview.resourcePreviews[0].remoteResource, content);
            await testObject.apply(false);
            assert.deepStrictEqual(server.requests, []);
        });
        test('sync throws invalid content error - content is an object', async () => {
            await client.instantiationService.get(files_1.$6j).writeFile(client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.keybindingsResource, buffer_1.$Fd.fromString('{}'));
            try {
                await testObject.sync(await client.getResourceManifest());
                assert.fail('should fail with invalid content error');
            }
            catch (e) {
                assert.ok(e instanceof userDataSync_1.$Kgb);
                assert.deepStrictEqual(e.code, "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */);
            }
        });
        test('sync profile keybindings', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const profile = await client2.instantiationService.get(userDataProfile_1.$Ek).createNamedProfile('profile1');
            await client2.instantiationService.get(files_1.$6j).writeFile(profile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([
                {
                    'key': 'shift+cmd+w',
                    'command': 'workbench.action.closeAllEditors',
                }
            ])));
            await client2.sync();
            await client.sync();
            const syncedProfile = client.instantiationService.get(userDataProfile_1.$Ek).profiles.find(p => p.id === profile.id);
            const content = (await client.instantiationService.get(files_1.$6j).readFile(syncedProfile.keybindingsResource)).value.toString();
            assert.deepStrictEqual(JSON.parse(content), [
                {
                    'key': 'shift+cmd+w',
                    'command': 'workbench.action.closeAllEditors',
                }
            ]);
        });
    });
});
//# sourceMappingURL=keybindingsSync.test.js.map