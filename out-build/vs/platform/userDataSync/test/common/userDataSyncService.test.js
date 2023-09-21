/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/resources", "vs/base/test/common/utils", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/test/common/userDataSyncClient"], function (require, exports, assert, buffer_1, resources_1, utils_1, environment_1, files_1, userDataProfile_1, userDataSync_1, userDataSyncClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('UserDataSyncService', () => {
        const disposableStore = (0, utils_1.$bT)();
        test('test first time sync ever', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            // Sync for first time
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
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
            ]);
        });
        test('test first time sync ever when a sync resource is disabled', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            client.instantiationService.get(userDataSync_1.$Pgb).setResourceEnablement("settings" /* SyncResource.Settings */, false);
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            // Sync for first time
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                // Keybindings
                { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/keybindings`, headers: { 'If-Match': '0' } },
                // Snippets
                { type: 'GET', url: `${target.url}/v1/resource/snippets/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/snippets`, headers: { 'If-Match': '0' } },
                // Snippets
                { type: 'GET', url: `${target.url}/v1/resource/tasks/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/tasks`, headers: { 'If-Match': '0' } },
                // Global state
                { type: 'GET', url: `${target.url}/v1/resource/globalState/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/globalState`, headers: { 'If-Match': '0' } },
                // Extensions
                { type: 'GET', url: `${target.url}/v1/resource/extensions/latest`, headers: {} },
                // Profiles
                { type: 'GET', url: `${target.url}/v1/resource/profiles/latest`, headers: {} },
            ]);
        });
        test('test first time sync ever with no data', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp(true);
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            // Sync for first time
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                // Settings
                { type: 'GET', url: `${target.url}/v1/resource/settings/latest`, headers: {} },
                // Keybindings
                { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: {} },
                // Snippets
                { type: 'GET', url: `${target.url}/v1/resource/snippets/latest`, headers: {} },
                // Tasks
                { type: 'GET', url: `${target.url}/v1/resource/tasks/latest`, headers: {} },
                // Global state
                { type: 'GET', url: `${target.url}/v1/resource/globalState/latest`, headers: {} },
                // Extensions
                { type: 'GET', url: `${target.url}/v1/resource/extensions/latest`, headers: {} },
                // Profiles
                { type: 'GET', url: `${target.url}/v1/resource/profiles/latest`, headers: {} },
            ]);
        });
        test('test first time sync from the client with no changes - merge', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the first client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Setup the test client
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            // Sync (merge) from the test client
            target.reset();
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/settings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/snippets/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/tasks/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/globalState/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/extensions/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/profiles/latest`, headers: {} },
            ]);
        });
        test('test first time sync from the client with changes - merge', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the first client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Setup the test client with changes
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            const fileService = testClient.instantiationService.get(files_1.$6j);
            const environmentService = testClient.instantiationService.get(environment_1.$Ih);
            const userDataProfilesService = testClient.instantiationService.get(userDataProfile_1.$Ek);
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'de' })));
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.$Fd.fromString(`{}`));
            await fileService.writeFile((0, resources_1.$ig)((0, resources_1.$hg)(userDataProfilesService.defaultProfile.settingsResource), 'tasks.json'), buffer_1.$Fd.fromString(JSON.stringify({})));
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            // Sync (merge) from the test client
            target.reset();
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/settings/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/settings`, headers: { 'If-Match': '1' } },
                { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/keybindings`, headers: { 'If-Match': '1' } },
                { type: 'GET', url: `${target.url}/v1/resource/snippets/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/snippets`, headers: { 'If-Match': '1' } },
                { type: 'GET', url: `${target.url}/v1/resource/tasks/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/globalState/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/extensions/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/profiles/latest`, headers: {} },
            ]);
        });
        test('test first time sync from the client with changes - merge with profile', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the first client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Setup the test client with changes
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            const fileService = testClient.instantiationService.get(files_1.$6j);
            const environmentService = testClient.instantiationService.get(environment_1.$Ih);
            const userDataProfilesService = testClient.instantiationService.get(userDataProfile_1.$Ek);
            await userDataProfilesService.createNamedProfile('1');
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'de' })));
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.$Fd.fromString(`{}`));
            await fileService.writeFile((0, resources_1.$ig)((0, resources_1.$hg)(userDataProfilesService.defaultProfile.settingsResource), 'tasks.json'), buffer_1.$Fd.fromString(JSON.stringify({})));
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            // Sync (merge) from the test client
            target.reset();
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/settings/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/settings`, headers: { 'If-Match': '1' } },
                { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/keybindings`, headers: { 'If-Match': '1' } },
                { type: 'GET', url: `${target.url}/v1/resource/snippets/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/snippets`, headers: { 'If-Match': '1' } },
                { type: 'GET', url: `${target.url}/v1/resource/tasks/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/globalState/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/extensions/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/resource/profiles/latest`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/collection`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/profiles`, headers: { 'If-Match': '0' } },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/settings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/keybindings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/snippets/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/tasks/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/globalState/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/extensions/latest`, headers: {} },
            ]);
        });
        test('test sync when there are no changes', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            // sync from the client again
            target.reset();
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
            ]);
        });
        test('test sync when there are local changes', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            target.reset();
            // Do changes in the client
            const fileService = client.instantiationService.get(files_1.$6j);
            const environmentService = client.instantiationService.get(environment_1.$Ih);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.$Fd.fromString(`{}`));
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'de' })));
            // Sync from the client
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
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
        test('test sync when there are local changes with profile', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            target.reset();
            // Do changes in the client
            const fileService = client.instantiationService.get(files_1.$6j);
            const environmentService = client.instantiationService.get(environment_1.$Ih);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await userDataProfilesService.createNamedProfile('1');
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.$Fd.fromString(`{}`));
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'de' })));
            // Sync from the client
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                // Settings
                { type: 'POST', url: `${target.url}/v1/resource/settings`, headers: { 'If-Match': '1' } },
                // Keybindings
                { type: 'POST', url: `${target.url}/v1/resource/keybindings`, headers: { 'If-Match': '1' } },
                // Snippets
                { type: 'POST', url: `${target.url}/v1/resource/snippets`, headers: { 'If-Match': '1' } },
                // Global state
                { type: 'POST', url: `${target.url}/v1/resource/globalState`, headers: { 'If-Match': '1' } },
                // Profiles
                { type: 'POST', url: `${target.url}/v1/collection`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/profiles`, headers: { 'If-Match': '0' } },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/settings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/keybindings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/snippets/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/tasks/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/globalState/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/extensions/latest`, headers: {} },
            ]);
        });
        test('test sync when there are local changes and sync resource is disabled', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            target.reset();
            // Do changes in the client
            const fileService = client.instantiationService.get(files_1.$6j);
            const environmentService = client.instantiationService.get(environment_1.$Ih);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.$Fd.fromString(`{}`));
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'de' })));
            client.instantiationService.get(userDataSync_1.$Pgb).setResourceEnablement("snippets" /* SyncResource.Snippets */, false);
            // Sync from the client
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                // Settings
                { type: 'POST', url: `${target.url}/v1/resource/settings`, headers: { 'If-Match': '1' } },
                // Keybindings
                { type: 'POST', url: `${target.url}/v1/resource/keybindings`, headers: { 'If-Match': '1' } },
                // Global state
                { type: 'POST', url: `${target.url}/v1/resource/globalState`, headers: { 'If-Match': '1' } },
            ]);
        });
        test('test sync when there are remote changes', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Sync from first client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Sync from test client
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            // Do changes in first client and sync
            const fileService = client.instantiationService.get(files_1.$6j);
            const environmentService = client.instantiationService.get(environment_1.$Ih);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.$Fd.fromString(`{ "a": "changed" }`));
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'de' })));
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Sync from test client
            target.reset();
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                // Settings
                { type: 'GET', url: `${target.url}/v1/resource/settings/latest`, headers: { 'If-None-Match': '1' } },
                // Keybindings
                { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: { 'If-None-Match': '1' } },
                // Snippets
                { type: 'GET', url: `${target.url}/v1/resource/snippets/latest`, headers: { 'If-None-Match': '1' } },
                // Global state
                { type: 'GET', url: `${target.url}/v1/resource/globalState/latest`, headers: { 'If-None-Match': '1' } },
            ]);
        });
        test('test sync when there are remote changes with profile', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Sync from first client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Sync from test client
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            // Do changes in first client and sync
            const fileService = client.instantiationService.get(files_1.$6j);
            const environmentService = client.instantiationService.get(environment_1.$Ih);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await userDataProfilesService.createNamedProfile('1');
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.$Fd.fromString(`{ "a": "changed" }`));
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'de' })));
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Sync from test client
            target.reset();
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                // Settings
                { type: 'GET', url: `${target.url}/v1/resource/settings/latest`, headers: { 'If-None-Match': '1' } },
                // Keybindings
                { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: { 'If-None-Match': '1' } },
                // Snippets
                { type: 'GET', url: `${target.url}/v1/resource/snippets/latest`, headers: { 'If-None-Match': '1' } },
                // Global state
                { type: 'GET', url: `${target.url}/v1/resource/globalState/latest`, headers: { 'If-None-Match': '1' } },
                // Profiles
                { type: 'GET', url: `${target.url}/v1/resource/profiles/latest`, headers: { 'If-None-Match': '0' } },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/settings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/keybindings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/snippets/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/tasks/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/globalState/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/extensions/latest`, headers: {} },
            ]);
        });
        test('test delete', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Sync from the client
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            // Reset from the client
            target.reset();
            await testObject.reset();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'DELETE', url: `${target.url}/v1/collection`, headers: {} },
                { type: 'DELETE', url: `${target.url}/v1/resource`, headers: {} },
            ]);
        });
        test('test delete and sync', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Sync from the client
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            // Reset from the client
            await testObject.reset();
            // Sync again
            target.reset();
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
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
            ]);
        });
        test('test sync status', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup the client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            // sync from the client
            const actualStatuses = [];
            const disposable = testObject.onDidChangeStatus(status => actualStatuses.push(status));
            await (await testObject.createSyncTask(null)).run();
            disposable.dispose();
            assert.deepStrictEqual(actualStatuses, ["syncing" /* SyncStatus.Syncing */, "idle" /* SyncStatus.Idle */, "syncing" /* SyncStatus.Syncing */, "idle" /* SyncStatus.Idle */, "syncing" /* SyncStatus.Syncing */, "idle" /* SyncStatus.Idle */, "syncing" /* SyncStatus.Syncing */, "idle" /* SyncStatus.Idle */, "syncing" /* SyncStatus.Syncing */, "idle" /* SyncStatus.Idle */, "syncing" /* SyncStatus.Syncing */, "idle" /* SyncStatus.Idle */, "syncing" /* SyncStatus.Syncing */, "idle" /* SyncStatus.Idle */]);
        });
        test('test sync conflicts status', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the first client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            let fileService = client.instantiationService.get(files_1.$6j);
            let userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Setup the test client
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            fileService = testClient.instantiationService.get(files_1.$6j);
            userDataProfilesService = testClient.instantiationService.get(userDataProfile_1.$Ek);
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 16 })));
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            // sync from the client
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assert.deepStrictEqual(testObject.conflicts.map(({ syncResource }) => syncResource), ["settings" /* SyncResource.Settings */]);
        });
        test('test sync will sync other non conflicted areas', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the first client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const fileService = client.instantiationService.get(files_1.$6j);
            let userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Setup the test client and get conflicts in settings
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            const testFileService = testClient.instantiationService.get(files_1.$6j);
            userDataProfilesService = testClient.instantiationService.get(userDataProfile_1.$Ek);
            await testFileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 16 })));
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            // sync from the first client with changes in keybindings
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // sync from the test client
            target.reset();
            const actualStatuses = [];
            const disposable = testObject.onDidChangeStatus(status => actualStatuses.push(status));
            await (await testObject.createSyncTask(null)).run();
            disposable.dispose();
            assert.deepStrictEqual(actualStatuses, []);
            assert.deepStrictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                // Keybindings
                { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: { 'If-None-Match': '1' } },
            ]);
        });
        test('test stop sync reset status', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the first client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            let fileService = client.instantiationService.get(files_1.$6j);
            let userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Setup the test client
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            fileService = testClient.instantiationService.get(files_1.$6j);
            userDataProfilesService = testClient.instantiationService.get(userDataProfile_1.$Ek);
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 16 })));
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            const syncTask = (await testObject.createSyncTask(null));
            syncTask.run().then(null, () => null /* ignore error */);
            await syncTask.stop();
            assert.deepStrictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            assert.deepStrictEqual(testObject.conflicts, []);
        });
        test('test sync send execution id header', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            for (const request of target.requestsWithAllHeaders) {
                const hasExecutionIdHeader = request.headers && request.headers['X-Execution-Id'] && request.headers['X-Execution-Id'].length > 0;
                assert.ok(hasExecutionIdHeader, `Should have execution header: ${request.url}`);
            }
        });
        test('test can run sync taks only once', async () => {
            // Setup the client
            const target = new userDataSyncClient_1.$X$b();
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            const syncTask = await testObject.createSyncTask(null);
            await syncTask.run();
            try {
                await syncTask.run();
                assert.fail('Should fail running the task again');
            }
            catch (error) {
                /* expected */
            }
        });
        test('test sync when there are local profile that uses default profile', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Setup and sync from the client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            const testObject = client.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            target.reset();
            // Do changes in the client
            const fileService = client.instantiationService.get(files_1.$6j);
            const environmentService = client.instantiationService.get(environment_1.$Ih);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await userDataProfilesService.createNamedProfile('1', { useDefaultFlags: { settings: true } });
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.$Fd.fromString(`{}`));
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'de' })));
            // Sync from the client
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                // Settings
                { type: 'POST', url: `${target.url}/v1/resource/settings`, headers: { 'If-Match': '1' } },
                // Keybindings
                { type: 'POST', url: `${target.url}/v1/resource/keybindings`, headers: { 'If-Match': '1' } },
                // Snippets
                { type: 'POST', url: `${target.url}/v1/resource/snippets`, headers: { 'If-Match': '1' } },
                // Global state
                { type: 'POST', url: `${target.url}/v1/resource/globalState`, headers: { 'If-Match': '1' } },
                // Profiles
                { type: 'POST', url: `${target.url}/v1/collection`, headers: {} },
                { type: 'POST', url: `${target.url}/v1/resource/profiles`, headers: { 'If-Match': '0' } },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/keybindings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/snippets/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/tasks/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/globalState/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/extensions/latest`, headers: {} },
            ]);
        });
        test('test sync when there is a remote profile that uses default profile', async () => {
            const target = new userDataSyncClient_1.$X$b();
            // Sync from first client
            const client = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await client.setUp();
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Sync from test client
            const testClient = disposableStore.add(new userDataSyncClient_1.$W$b(target));
            await testClient.setUp();
            const testObject = testClient.instantiationService.get(userDataSync_1.$Qgb);
            await (await testObject.createSyncTask(null)).run();
            // Do changes in first client and sync
            const fileService = client.instantiationService.get(files_1.$6j);
            const environmentService = client.instantiationService.get(environment_1.$Ih);
            const userDataProfilesService = client.instantiationService.get(userDataProfile_1.$Ek);
            await userDataProfilesService.createNamedProfile('1', { useDefaultFlags: { keybindings: true } });
            await fileService.writeFile(userDataProfilesService.defaultProfile.settingsResource, buffer_1.$Fd.fromString(JSON.stringify({ 'editor.fontSize': 14 })));
            await fileService.writeFile(userDataProfilesService.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(JSON.stringify([{ 'command': 'abcd', 'key': 'cmd+c' }])));
            await fileService.writeFile((0, resources_1.$ig)(userDataProfilesService.defaultProfile.snippetsHome, 'html.json'), buffer_1.$Fd.fromString(`{ "a": "changed" }`));
            await fileService.writeFile(environmentService.argvResource, buffer_1.$Fd.fromString(JSON.stringify({ 'locale': 'de' })));
            await (await client.instantiationService.get(userDataSync_1.$Qgb).createSyncTask(null)).run();
            // Sync from test client
            target.reset();
            await (await testObject.createSyncTask(null)).run();
            assert.deepStrictEqual(target.requests, [
                // Manifest
                { type: 'GET', url: `${target.url}/v1/manifest`, headers: {} },
                // Settings
                { type: 'GET', url: `${target.url}/v1/resource/settings/latest`, headers: { 'If-None-Match': '1' } },
                // Keybindings
                { type: 'GET', url: `${target.url}/v1/resource/keybindings/latest`, headers: { 'If-None-Match': '1' } },
                // Snippets
                { type: 'GET', url: `${target.url}/v1/resource/snippets/latest`, headers: { 'If-None-Match': '1' } },
                // Global state
                { type: 'GET', url: `${target.url}/v1/resource/globalState/latest`, headers: { 'If-None-Match': '1' } },
                // Profiles
                { type: 'GET', url: `${target.url}/v1/resource/profiles/latest`, headers: { 'If-None-Match': '0' } },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/settings/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/snippets/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/tasks/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/globalState/latest`, headers: {} },
                { type: 'GET', url: `${target.url}/v1/collection/1/resource/extensions/latest`, headers: {} },
            ]);
        });
    });
});
//# sourceMappingURL=userDataSyncService.test.js.map