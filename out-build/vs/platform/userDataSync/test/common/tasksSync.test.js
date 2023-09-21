/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/tasksSync", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/test/common/userDataSyncClient"], function (require, exports, assert, buffer_1, utils_1, files_1, log_1, userDataProfile_1, tasksSync_1, userDataSync_1, userDataSyncClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TasksSync', () => {
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
            testObject = client.getSynchronizer("tasks" /* SyncResource.Tasks */);
        });
        test('when tasks file does not exist', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            assert.deepStrictEqual(await testObject.getLastSyncUserData(), null);
            let manifest = await client.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, [
                { type: 'GET', url: `${server.url}/v1/resource/${testObject.resource}/latest`, headers: {} },
            ]);
            assert.ok(!await fileService.exists(tasksResource));
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
        test('when tasks file does not exist and remote has changes', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            const tasksResource2 = client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await client2.instantiationService.get(files_1.$6j).writeFile(tasksResource2, buffer_1.$Fd.fromString(content));
            await client2.sync();
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(tasksResource)).value.toString(), content);
        });
        test('when tasks file exists locally and remote has no tasks', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(content));
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
        });
        test('first time sync: when tasks file exists locally with same content as remote', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            const tasksResource2 = client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await client2.instantiationService.get(files_1.$6j).writeFile(tasksResource2, buffer_1.$Fd.fromString(content));
            await client2.sync();
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(content));
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(tasksResource)).value.toString(), content);
        });
        test('when tasks file locally has moved forward', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': []
            })));
            await testObject.sync(await client.getResourceManifest());
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(content));
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
        });
        test('when tasks file remotely has moved forward', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const tasksResource2 = client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            const fileService2 = client2.instantiationService.get(files_1.$6j);
            await fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': []
            })));
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await client2.sync();
            await testObject.sync(await client.getResourceManifest());
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(content));
            await client2.sync();
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(tasksResource)).value.toString(), content);
        });
        test('when tasks file has moved forward locally and remotely with same changes', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const tasksResource2 = client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            const fileService2 = client2.instantiationService.get(files_1.$6j);
            await fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': []
            })));
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await client2.sync();
            await testObject.sync(await client.getResourceManifest());
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(content));
            await client2.sync();
            fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(content));
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(tasksResource)).value.toString(), content);
        });
        test('when tasks file has moved forward locally and remotely - accept preview', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const tasksResource2 = client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            const fileService2 = client2.instantiationService.get(files_1.$6j);
            await fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': []
            })));
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await client2.sync();
            await testObject.sync(await client.getResourceManifest());
            fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                    }]
            })));
            await client2.sync();
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(content));
            await testObject.sync(await client.getResourceManifest());
            const previewContent = (await fileService.readFile(testObject.conflicts.conflicts[0].previewResource)).value.toString();
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assert.deepStrictEqual(testObject.conflicts.conflicts.length, 1);
            assert.deepStrictEqual(testObject.conflicts.conflicts[0].mergeState, "conflict" /* MergeState.Conflict */);
            assert.deepStrictEqual(testObject.conflicts.conflicts[0].localChange, 2 /* Change.Modified */);
            assert.deepStrictEqual(testObject.conflicts.conflicts[0].remoteChange, 2 /* Change.Modified */);
            await testObject.accept(testObject.conflicts.conflicts[0].previewResource);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), previewContent);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), previewContent);
            assert.strictEqual((await fileService.readFile(tasksResource)).value.toString(), previewContent);
        });
        test('when tasks file has moved forward locally and remotely - accept modified preview', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const tasksResource2 = client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            const fileService2 = client2.instantiationService.get(files_1.$6j);
            await fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': []
            })));
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await client2.sync();
            await testObject.sync(await client.getResourceManifest());
            fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                    }]
            })));
            await client2.sync();
            fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            })));
            await testObject.sync(await client.getResourceManifest());
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch 2'
                    }]
            });
            await testObject.accept(testObject.conflicts.conflicts[0].previewResource, content);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(tasksResource)).value.toString(), content);
        });
        test('when tasks file has moved forward locally and remotely - accept remote', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const tasksResource2 = client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            const fileService2 = client2.instantiationService.get(files_1.$6j);
            await fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': []
            })));
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await client2.sync();
            await testObject.sync(await client.getResourceManifest());
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                    }]
            });
            fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(content));
            await client2.sync();
            fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            })));
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            await testObject.accept(testObject.conflicts.conflicts[0].remoteResource);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(tasksResource)).value.toString(), content);
        });
        test('when tasks file has moved forward locally and remotely - accept local', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const tasksResource2 = client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            const fileService2 = client2.instantiationService.get(files_1.$6j);
            await fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': []
            })));
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await client2.sync();
            await testObject.sync(await client.getResourceManifest());
            fileService2.writeFile(tasksResource2, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                    }]
            })));
            await client2.sync();
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(content));
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            await testObject.accept(testObject.conflicts.conflicts[0].localResource);
            await testObject.apply(false);
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
            assert.strictEqual((await fileService.readFile(tasksResource)).value.toString(), content);
        });
        test('when tasks file was removed in one client', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await fileService.writeFile(tasksResource, buffer_1.$Fd.fromString(JSON.stringify({
                'version': '2.0.0',
                'tasks': []
            })));
            await testObject.sync(await client.getResourceManifest());
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            await client2.sync();
            const tasksResource2 = client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            const fileService2 = client2.instantiationService.get(files_1.$6j);
            fileService2.del(tasksResource2);
            await client2.sync();
            await testObject.sync(await client.getResourceManifest());
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), null);
            assert.strictEqual((0, tasksSync_1.$42b)(remoteUserData.syncData.content, client.instantiationService.get(log_1.$5i)), null);
            assert.strictEqual(await fileService.exists(tasksResource), false);
        });
        test('when tasks file is created after first sync', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            await testObject.sync(await client.getResourceManifest());
            const content = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            await fileService.createFile(tasksResource, buffer_1.$Fd.fromString(content));
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
            assert.strictEqual((0, tasksSync_1.$42b)(lastSyncUserData.syncData.content, client.instantiationService.get(log_1.$5i)), content);
        });
        test('apply remote when tasks file does not exist', async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const tasksResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.tasksResource;
            if (await fileService.exists(tasksResource)) {
                await fileService.del(tasksResource);
            }
            const preview = (await testObject.preview(await client.getResourceManifest(), {}));
            server.reset();
            const content = await testObject.resolveContent(preview.resourcePreviews[0].remoteResource);
            await testObject.accept(preview.resourcePreviews[0].remoteResource, content);
            await testObject.apply(false);
            assert.deepStrictEqual(server.requests, []);
        });
        test('sync profile tasks', async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const profile = await client2.instantiationService.get(userDataProfile_1.$Ek).createNamedProfile('profile1');
            const expected = JSON.stringify({
                'version': '2.0.0',
                'tasks': [{
                        'type': 'npm',
                        'script': 'watch',
                        'label': 'Watch'
                    }]
            });
            await client2.instantiationService.get(files_1.$6j).createFile(profile.tasksResource, buffer_1.$Fd.fromString(expected));
            await client2.sync();
            await client.sync();
            const syncedProfile = client.instantiationService.get(userDataProfile_1.$Ek).profiles.find(p => p.id === profile.id);
            const actual = (await client.instantiationService.get(files_1.$6j).readFile(syncedProfile.tasksResource)).value.toString();
            assert.strictEqual(actual, expected);
        });
    });
});
//# sourceMappingURL=tasksSync.test.js.map