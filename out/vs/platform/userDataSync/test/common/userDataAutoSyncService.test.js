/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/resources", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataAutoSyncService", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/userDataSync/test/common/userDataSyncClient"], function (require, exports, assert, buffer_1, event_1, resources_1, timeTravelScheduler_1, utils_1, environment_1, files_1, userDataProfile_1, userDataAutoSyncService_1, userDataSync_1, userDataSyncMachines_1, userDataSyncClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestUserDataAutoSyncService extends userDataAutoSyncService_1.UserDataAutoSyncService {
        startAutoSync() { return false; }
        getSyncTriggerDelayTime() { return 50; }
        sync() {
            return this.triggerSync(['sync'], false, false);
        }
    }
    suite('UserDataAutoSyncService', () => {
        const disposableStore = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('test auto sync with sync resource change triggers sync', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                // Setup the client
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                // Sync once and reset requests
                await (await client.instantiationService.get(userDataSync_1.IUserDataSyncService).createSyncTask(null)).run();
                target.reset();
                const testObject = disposableStore.add(client.instantiationService.createInstance(TestUserDataAutoSyncService));
                // Trigger auto sync with settings change
                await testObject.triggerSync(["settings" /* SyncResource.Settings */], false, false);
                // Filter out machine requests
                const actual = target.requests.filter(request => !request.url.startsWith(`${target.url}/v1/resource/machines`));
                // Make sure only one manifest request is made
                assert.deepStrictEqual(actual, [{ type: 'GET', url: `${target.url}/v1/manifest`, headers: {} }]);
            });
        });
        test('test auto sync with sync resource change triggers sync for every change', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                // Setup the client
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                // Sync once and reset requests
                await (await client.instantiationService.get(userDataSync_1.IUserDataSyncService).createSyncTask(null)).run();
                target.reset();
                const testObject = disposableStore.add(client.instantiationService.createInstance(TestUserDataAutoSyncService));
                // Trigger auto sync with settings change multiple times
                for (let counter = 0; counter < 2; counter++) {
                    await testObject.triggerSync(["settings" /* SyncResource.Settings */], false, false);
                }
                // Filter out machine requests
                const actual = target.requests.filter(request => !request.url.startsWith(`${target.url}/v1/resource/machines`));
                assert.deepStrictEqual(actual, [
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: { 'If-None-Match': '1' } }
                ]);
            });
        });
        test('test auto sync with non sync resource change triggers sync', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                // Setup the client
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                // Sync once and reset requests
                await (await client.instantiationService.get(userDataSync_1.IUserDataSyncService).createSyncTask(null)).run();
                target.reset();
                const testObject = disposableStore.add(client.instantiationService.createInstance(TestUserDataAutoSyncService));
                // Trigger auto sync with window focus once
                await testObject.triggerSync(['windowFocus'], true, false);
                // Filter out machine requests
                const actual = target.requests.filter(request => !request.url.startsWith(`${target.url}/v1/resource/machines`));
                // Make sure only one manifest request is made
                assert.deepStrictEqual(actual, [{ type: 'GET', url: `${target.url}/v1/manifest`, headers: {} }]);
            });
        });
        test('test auto sync with non sync resource change does not trigger continuous syncs', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                // Setup the client
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                // Sync once and reset requests
                await (await client.instantiationService.get(userDataSync_1.IUserDataSyncService).createSyncTask(null)).run();
                target.reset();
                const testObject = disposableStore.add(client.instantiationService.createInstance(TestUserDataAutoSyncService));
                // Trigger auto sync with window focus multiple times
                for (let counter = 0; counter < 2; counter++) {
                    await testObject.triggerSync(['windowFocus'], true, false);
                }
                // Filter out machine requests
                const actual = target.requests.filter(request => !request.url.startsWith(`${target.url}/v1/resource/machines`));
                // Make sure only one manifest request is made
                assert.deepStrictEqual(actual, [{ type: 'GET', url: `${target.url}/v1/manifest`, headers: {} }]);
            });
        });
        test('test first auto sync requests', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                // Setup the client
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                const testObject = disposableStore.add(client.instantiationService.createInstance(TestUserDataAutoSyncService));
                await testObject.sync();
                assert.deepStrictEqual(target.requests, [
                    // Manifest
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                    // Machines
                    { type: 'GET', url: `${target.url}/v1/resource/machines/latest`, headers: {} },
                    // Settings
                    { type: 'GET', url: `${target.url}/v1/resource/settings/latest`, headers: {} },
                    { type: 'POST', url: `${target.url}/v1/resource/settings`, headers: { 'If-Match': '0' } },
                    // Keybindings
                    { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: {} },
                    { type: 'POST', url: `${target.url}/v1/resource/keybindings`, headers: { 'If-Match': '0' } },
                    // Snippets
                    { type: 'GET', url: `${target.url}/v1/resource/snippets/latest`, headers: {} },
                    { type: 'POST', url: `${target.url}/v1/resource/snippets`, headers: { 'If-Match': '0' } },
                    // Tasks
                    { type: 'GET', url: `${target.url}/v1/resource/tasks/latest`, headers: {} },
                    { type: 'POST', url: `${target.url}/v1/resource/tasks`, headers: { 'If-Match': '0' } },
                    // Global state
                    { type: 'GET', url: `${target.url}/v1/resource/globalState/latest`, headers: {} },
                    { type: 'POST', url: `${target.url}/v1/resource/globalState`, headers: { 'If-Match': '0' } },
                    // Extensions
                    { type: 'GET', url: `${target.url}/v1/resource/extensions/latest`, headers: {} },
                    // Profiles
                    { type: 'GET', url: `${target.url}/v1/resource/profiles/latest`, headers: {} },
                    // Manifest
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                    // Machines
                    { type: 'POST', url: `${target.url}/v1/resource/machines`, headers: { 'If-Match': '0' } }
                ]);
            });
        });
        test('test further auto sync requests without changes', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                // Setup the client
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                const testObject = disposableStore.add(client.instantiationService.createInstance(TestUserDataAutoSyncService));
                // Sync once and reset requests
                await testObject.sync();
                target.reset();
                await testObject.sync();
                assert.deepStrictEqual(target.requests, [
                    // Manifest
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: { 'If-None-Match': '1' } }
                ]);
            });
        });
        test('test further auto sync requests with changes', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                // Setup the client
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                const testObject = disposableStore.add(client.instantiationService.createInstance(TestUserDataAutoSyncService));
                // Sync once and reset requests
                await testObject.sync();
                target.reset();
                // Do changes in the client
                const fileService = client.instantiationService.get(files_1.IFileService);
                const environmentService = client.instantiationService.get(environment_1.IEnvironmentService);
                const userDataProfilesService = client.instantiationService.get(userDataProfile_1.IUserDataProfilesService);
                await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.VSBuffer.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
                await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.VSBuffer.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
                await fileService.writeFile((0, resources_1.joinPath)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.VSBuffer.fromString(`{}`));
                await fileService.writeFile(environmentService.argvResource, buffer_1.VSBuffer.fromString(JSON.stringify({ 'locale': 'de' })));
                await testObject.sync();
                assert.deepStrictEqual(target.requests, [
                    // Manifest
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: { 'If-None-Match': '1' } },
                    // Settings
                    { type: 'POST', url: `${target.url}/v1/resource/settings`, headers: { 'If-Match': '1' } },
                    // Keybindings
                    { type: 'POST', url: `${target.url}/v1/resource/keybindings`, headers: { 'If-Match': '1' } },
                    // Snippets
                    { type: 'POST', url: `${target.url}/v1/resource/snippets`, headers: { 'If-Match': '1' } },
                    // Global state
                    { type: 'POST', url: `${target.url}/v1/resource/globalState`, headers: { 'If-Match': '1' } },
                ]);
            });
        });
        test('test auto sync send execution id header', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                // Setup the client
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                const testObject = disposableStore.add(client.instantiationService.createInstance(TestUserDataAutoSyncService));
                // Sync once and reset requests
                await testObject.sync();
                target.reset();
                await testObject.sync();
                for (const request of target.requestsWithAllHeaders) {
                    const hasExecutionIdHeader = request.headers && request.headers['X-Execution-Id'] && request.headers['X-Execution-Id'].length > 0;
                    if (request.url.startsWith(`${target.url}/v1/resource/machines`)) {
                        assert.ok(!hasExecutionIdHeader, `Should not have execution header: ${request.url}`);
                    }
                    else {
                        assert.ok(hasExecutionIdHeader, `Should have execution header: ${request.url}`);
                    }
                }
            });
        });
        test('test delete on one client throws turned off error on other client while syncing', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                // Set up and sync from the client
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                await (await client.instantiationService.get(userDataSync_1.IUserDataSyncService).createSyncTask(null)).run();
                // Set up and sync from the test client
                const testClient = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await testClient.setUp();
                const testObject = disposableStore.add(testClient.instantiationService.createInstance(TestUserDataAutoSyncService));
                await testObject.sync();
                // Reset from the first client
                await client.instantiationService.get(userDataSync_1.IUserDataSyncService).reset();
                // Sync from the test client
                target.reset();
                const errorPromise = event_1.Event.toPromise(testObject.onError);
                await testObject.sync();
                const e = await errorPromise;
                assert.ok(e instanceof userDataSync_1.UserDataAutoSyncError);
                assert.deepStrictEqual(e.code, "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */);
                assert.deepStrictEqual(target.requests, [
                    // Manifest
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: { 'If-None-Match': '1' } },
                    // Machine
                    { type: 'GET', url: `${target.url}/v1/resource/machines/latest`, headers: { 'If-None-Match': '1' } },
                ]);
            });
        });
        test('test disabling the machine turns off sync', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                // Set up and sync from the test client
                const testClient = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await testClient.setUp();
                const testObject = disposableStore.add(testClient.instantiationService.createInstance(TestUserDataAutoSyncService));
                await testObject.sync();
                // Disable current machine
                const userDataSyncMachinesService = testClient.instantiationService.get(userDataSyncMachines_1.IUserDataSyncMachinesService);
                const machines = await userDataSyncMachinesService.getMachines();
                const currentMachine = machines.find(m => m.isCurrent);
                await userDataSyncMachinesService.setEnablements([[currentMachine.id, false]]);
                target.reset();
                const errorPromise = event_1.Event.toPromise(testObject.onError);
                await testObject.sync();
                const e = await errorPromise;
                assert.ok(e instanceof userDataSync_1.UserDataAutoSyncError);
                assert.deepStrictEqual(e.code, "TurnedOff" /* UserDataSyncErrorCode.TurnedOff */);
                assert.deepStrictEqual(target.requests, [
                    // Manifest
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: { 'If-None-Match': '1' } },
                    // Machine
                    { type: 'GET', url: `${target.url}/v1/resource/machines/latest`, headers: { 'If-None-Match': '2' } },
                    { type: 'POST', url: `${target.url}/v1/resource/machines`, headers: { 'If-Match': '2' } },
                ]);
            });
        });
        test('test removing the machine adds machine back', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                // Set up and sync from the test client
                const testClient = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await testClient.setUp();
                const testObject = disposableStore.add(testClient.instantiationService.createInstance(TestUserDataAutoSyncService));
                await testObject.sync();
                // Remove current machine
                await testClient.instantiationService.get(userDataSyncMachines_1.IUserDataSyncMachinesService).removeCurrentMachine();
                target.reset();
                await testObject.sync();
                assert.deepStrictEqual(target.requests, [
                    // Manifest
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: { 'If-None-Match': '1' } },
                    // Machine
                    { type: 'POST', url: `${target.url}/v1/resource/machines`, headers: { 'If-Match': '2' } },
                ]);
            });
        });
        test('test creating new session from one client throws session expired error on another client while syncing', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const target = new userDataSyncClient_1.UserDataSyncTestServer();
                // Set up and sync from the client
                const client = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await client.setUp();
                await (await client.instantiationService.get(userDataSync_1.IUserDataSyncService).createSyncTask(null)).run();
                // Set up and sync from the test client
                const testClient = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await testClient.setUp();
                const testObject = disposableStore.add(testClient.instantiationService.createInstance(TestUserDataAutoSyncService));
                await testObject.sync();
                // Reset from the first client
                await client.instantiationService.get(userDataSync_1.IUserDataSyncService).reset();
                // Sync again from the first client to create new session
                await (await client.instantiationService.get(userDataSync_1.IUserDataSyncService).createSyncTask(null)).run();
                // Sync from the test client
                target.reset();
                const errorPromise = event_1.Event.toPromise(testObject.onError);
                await testObject.sync();
                const e = await errorPromise;
                assert.ok(e instanceof userDataSync_1.UserDataAutoSyncError);
                assert.deepStrictEqual(e.code, "SessionExpired" /* UserDataSyncErrorCode.SessionExpired */);
                assert.deepStrictEqual(target.requests, [
                    // Manifest
                    { type: 'GET', url: `${target.url}/v1/manifest`, headers: { 'If-None-Match': '1' } },
                    // Machine
                    { type: 'GET', url: `${target.url}/v1/resource/machines/latest`, headers: { 'If-None-Match': '1' } },
                ]);
            });
        });
        test('test rate limit on server', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const target = new userDataSyncClient_1.UserDataSyncTestServer(5);
                // Set up and sync from the test client
                const testClient = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await testClient.setUp();
                const testObject = disposableStore.add(testClient.instantiationService.createInstance(TestUserDataAutoSyncService));
                const errorPromise = event_1.Event.toPromise(testObject.onError);
                while (target.requests.length < 5) {
                    await testObject.sync();
                }
                const e = await errorPromise;
                assert.ok(e instanceof userDataSync_1.UserDataSyncStoreError);
                assert.deepStrictEqual(e.code, "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */);
            });
        });
        test('test auto sync is suspended when server donot accepts requests', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const target = new userDataSyncClient_1.UserDataSyncTestServer(5, 1);
                // Set up and sync from the test client
                const testClient = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await testClient.setUp();
                const testObject = disposableStore.add(testClient.instantiationService.createInstance(TestUserDataAutoSyncService));
                while (target.requests.length < 5) {
                    await testObject.sync();
                }
                target.reset();
                await testObject.sync();
                assert.deepStrictEqual(target.requests, []);
            });
        });
        test('test cache control header with no cache is sent when triggered with disable cache option', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const target = new userDataSyncClient_1.UserDataSyncTestServer(5, 1);
                // Set up and sync from the test client
                const testClient = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await testClient.setUp();
                const testObject = disposableStore.add(testClient.instantiationService.createInstance(TestUserDataAutoSyncService));
                await testObject.triggerSync(['some reason'], true, true);
                assert.strictEqual(target.requestsWithAllHeaders[0].headers['Cache-Control'], 'no-cache');
            });
        });
        test('test cache control header is not sent when triggered without disable cache option', async () => {
            await (0, timeTravelScheduler_1.runWithFakedTimers)({}, async () => {
                const target = new userDataSyncClient_1.UserDataSyncTestServer(5, 1);
                // Set up and sync from the test client
                const testClient = disposableStore.add(new userDataSyncClient_1.UserDataSyncClient(target));
                await testClient.setUp();
                const testObject = disposableStore.add(testClient.instantiationService.createInstance(TestUserDataAutoSyncService));
                await testObject.triggerSync(['some reason'], true, false);
                assert.strictEqual(target.requestsWithAllHeaders[0].headers['Cache-Control'], undefined);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFBdXRvU3luY1NlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhU3luYy90ZXN0L2NvbW1vbi91c2VyRGF0YUF1dG9TeW5jU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZ0JoRyxNQUFNLDJCQUE0QixTQUFRLGlEQUF1QjtRQUM3QyxhQUFhLEtBQWMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzFDLHVCQUF1QixLQUFhLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVuRSxJQUFJO1lBQ0gsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pELENBQUM7S0FDRDtJQUVELEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFFckMsTUFBTSxlQUFlLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRWxFLElBQUksQ0FBQyx3REFBd0QsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN6RSxNQUFNLElBQUEsd0NBQWtCLEVBQUMsRUFBRSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUN2QyxtQkFBbUI7Z0JBQ25CLE1BQU0sTUFBTSxHQUFHLElBQUksMkNBQXNCLEVBQUUsQ0FBQztnQkFDNUMsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLHVDQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLE1BQU0sTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUVyQiwrQkFBK0I7Z0JBQy9CLE1BQU0sQ0FBQyxNQUFNLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsbUNBQW9CLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMs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