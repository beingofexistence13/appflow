/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/event", "vs/base/test/common/timeTravelScheduler", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/files/common/files", "vs/platform/registry/common/platform", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/settingsSync", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/test/common/userDataSyncClient"], function (require, exports, assert, buffer_1, event_1, timeTravelScheduler_1, utils_1, configuration_1, configurationRegistry_1, files_1, platform_1, userDataProfile_1, settingsSync_1, userDataSync_1, userDataSyncClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SettingsSync - Auto', () => {
        const server = new userDataSyncClient_1.$X$b();
        let client;
        let testObject;
        teardown(async () => {
            await client.instantiationService.get(userDataSync_1.$Fgb).clear();
        });
        const disposableStore = (0, utils_1.$bT)();
        setup(async () => {
            platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
                'id': 'settingsSync',
                'type': 'object',
                'properties': {
                    'settingsSync.machine': {
                        'type': 'string',
                        'scope': 2 /* ConfigurationScope.MACHINE */
                    },
                    'settingsSync.machineOverridable': {
                        'type': 'string',
                        'scope': 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */
                    }
                }
            });
            client = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client.setUp(true);
            testObject = client.getSynchronizer("settings" /* SyncResource.Settings */);
        });
        test('when settings file does not exist', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const settingResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.settingsResource;
            assert.deepStrictEqual(await testObject.getLastSyncUserData(), null);
            let manifest = await client.getResourceManifest();
            server.reset();
            await testObject.sync(manifest);
            assert.deepStrictEqual(server.requests, [
                { type: 'GET', url: `${server.url}/v1/resource/${testObject.resource}/latest`, headers: {} },
            ]);
            assert.ok(!await fileService.exists(settingResource));
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
        }));
        test('when settings file is empty and remote has no changes', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const settingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.settingsResource;
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString(''));
            await testObject.sync(await client.getResourceManifest());
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, settingsSync_1.$V2b)(lastSyncUserData.syncData.content)?.settings, '{}');
            assert.strictEqual((0, settingsSync_1.$V2b)(remoteUserData.syncData.content)?.settings, '{}');
            assert.strictEqual((await fileService.readFile(settingsResource)).value.toString(), '');
        }));
        test('when settings file is empty and remote has changes', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const content = `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",
	"workbench.tree.indent": 20,
	"workbench.colorCustomizations": {
		"editorLineNumber.activeForeground": "#ff0000",
		"[GitHub Sharp]": {
			"statusBarItem.remoteBackground": "#24292E",
			"editorPane.background": "#f3f1f11a"
		}
	},

	"gitBranch.base": "remote-repo/master",

	// Experimental
	"workbench.view.experimental.allowMovingToNewContainer": true,
}`;
            await client2.instantiationService.get(files_1.$6j).writeFile(client2.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.settingsResource, buffer_1.$Fd.fromString(content));
            await client2.sync();
            const fileService = client.instantiationService.get(files_1.$6j);
            const settingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.settingsResource;
            await fileService.writeFile(settingsResource, buffer_1.$Fd.fromString(''));
            await testObject.sync(await client.getResourceManifest());
            const lastSyncUserData = await testObject.getLastSyncUserData();
            const remoteUserData = await testObject.getRemoteUserData(null);
            assert.strictEqual((0, settingsSync_1.$V2b)(lastSyncUserData.syncData.content)?.settings, content);
            assert.strictEqual((0, settingsSync_1.$V2b)(remoteUserData.syncData.content)?.settings, content);
            assert.strictEqual((await fileService.readFile(settingsResource)).value.toString(), content);
        }));
        test('when settings file is created after first sync', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const fileService = client.instantiationService.get(files_1.$6j);
            const settingsResource = client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile.settingsResource;
            await testObject.sync(await client.getResourceManifest());
            await fileService.createFile(settingsResource, buffer_1.$Fd.fromString('{}'));
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
            assert.strictEqual((0, settingsSync_1.$V2b)(lastSyncUserData.syncData.content)?.settings, '{}');
        }));
        test('sync for first time to the server', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const expected = `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",
	"workbench.tree.indent": 20,
	"workbench.colorCustomizations": {
		"editorLineNumber.activeForeground": "#ff0000",
		"[GitHub Sharp]": {
			"statusBarItem.remoteBackground": "#24292E",
			"editorPane.background": "#f3f1f11a"
		}
	},

	"gitBranch.base": "remote-repo/master",

	// Experimental
	"workbench.view.experimental.allowMovingToNewContainer": true,
}`;
            await updateSettings(expected, client);
            await testObject.sync(await client.getResourceManifest());
            const { content } = await client.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSettings(content);
            assert.deepStrictEqual(actual, expected);
        }));
        test('do not sync machine settings', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const settingsContent = `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Machine
	"settingsSync.machine": "someValue",
	"settingsSync.machineOverridable": "someValue"
}`;
            await updateSettings(settingsContent, client);
            await testObject.sync(await client.getResourceManifest());
            const { content } = await client.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSettings(content);
            assert.deepStrictEqual(actual, `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp"
}`);
        }));
        test('do not sync machine settings when spread across file', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const settingsContent = `{
	// Always
	"files.autoSave": "afterDelay",
	"settingsSync.machine": "someValue",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Machine
	"settingsSync.machineOverridable": "someValue"
}`;
            await updateSettings(settingsContent, client);
            await testObject.sync(await client.getResourceManifest());
            const { content } = await client.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSettings(content);
            assert.deepStrictEqual(actual, `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp"
}`);
        }));
        test('do not sync machine settings when spread across file - 2', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const settingsContent = `{
	// Always
	"files.autoSave": "afterDelay",
	"settingsSync.machine": "someValue",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Machine
	"settingsSync.machineOverridable": "someValue",
	"files.simpleDialog.enable": true,
}`;
            await updateSettings(settingsContent, client);
            await testObject.sync(await client.getResourceManifest());
            const { content } = await client.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSettings(content);
            assert.deepStrictEqual(actual, `{
	// Always
	"files.autoSave": "afterDelay",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",
	"files.simpleDialog.enable": true,
}`);
        }));
        test('sync when all settings are machine settings', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const settingsContent = `{
	// Machine
	"settingsSync.machine": "someValue",
	"settingsSync.machineOverridable": "someValue"
}`;
            await updateSettings(settingsContent, client);
            await testObject.sync(await client.getResourceManifest());
            const { content } = await client.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSettings(content);
            assert.deepStrictEqual(actual, `{
}`);
        }));
        test('sync when all settings are machine settings with trailing comma', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const settingsContent = `{
	// Machine
	"settingsSync.machine": "someValue",
	"settingsSync.machineOverridable": "someValue",
}`;
            await updateSettings(settingsContent, client);
            await testObject.sync(await client.getResourceManifest());
            const { content } = await client.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSettings(content);
            assert.deepStrictEqual(actual, `{
	,
}`);
        }));
        test('local change event is triggered when settings are changed', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const content = `{
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,
}`;
            await updateSettings(content, client);
            await testObject.sync(await client.getResourceManifest());
            const promise = event_1.Event.toPromise(testObject.onDidChangeLocal);
            await updateSettings(`{
	"files.autoSave": "off",
	"files.simpleDialog.enable": true,
}`, client);
            await promise;
        }));
        test('do not sync ignored settings', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const settingsContent = `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Editor
	"editor.fontFamily": "Fira Code",

	// Terminal
	"terminal.integrated.shell.osx": "some path",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	]
}`;
            await updateSettings(settingsContent, client);
            await testObject.sync(await client.getResourceManifest());
            const { content } = await client.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSettings(content);
            assert.deepStrictEqual(actual, `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	]
}`);
        }));
        test('do not sync ignored and machine settings', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const settingsContent = `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Editor
	"editor.fontFamily": "Fira Code",

	// Terminal
	"terminal.integrated.shell.osx": "some path",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	],

	// Machine
	"settingsSync.machine": "someValue",
}`;
            await updateSettings(settingsContent, client);
            await testObject.sync(await client.getResourceManifest());
            const { content } = await client.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSettings(content);
            assert.deepStrictEqual(actual, `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	],
}`);
        }));
        test('sync throws invalid content error', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const expected = `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",
	"workbench.tree.indent": 20,
	"workbench.colorCustomizations": {
		"editorLineNumber.activeForeground": "#ff0000",
		"[GitHub Sharp]": {
			"statusBarItem.remoteBackground": "#24292E",
			"editorPane.background": "#f3f1f11a"
		}
	}

	"gitBranch.base": "remote-repo/master",

	// Experimental
	"workbench.view.experimental.allowMovingToNewContainer": true,
}`;
            await updateSettings(expected, client);
            try {
                await testObject.sync(await client.getResourceManifest());
                assert.fail('should fail with invalid content error');
            }
            catch (e) {
                assert.ok(e instanceof userDataSync_1.$Kgb);
                assert.deepStrictEqual(e.code, "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */);
            }
        }));
        test('sync throws invalid content error - content is an array', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            await updateSettings('[]', client);
            try {
                await testObject.sync(await client.getResourceManifest());
                assert.fail('should fail with invalid content error');
            }
            catch (e) {
                assert.ok(e instanceof userDataSync_1.$Kgb);
                assert.deepStrictEqual(e.code, "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */);
            }
        }));
        test('sync when there are conflicts', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            await updateSettings(JSON.stringify({
                'a': 1,
                'b': 2,
                'settingsSync.ignoredSettings': ['a']
            }), client2);
            await client2.sync();
            await updateSettings(JSON.stringify({
                'a': 2,
                'b': 1,
                'settingsSync.ignoredSettings': ['a']
            }), client);
            await testObject.sync(await client.getResourceManifest());
            assert.strictEqual(testObject.status, "hasConflicts" /* SyncStatus.HasConflicts */);
            assert.strictEqual(testObject.conflicts.conflicts[0].localResource.toString(), testObject.localResource.toString());
            const fileService = client.instantiationService.get(files_1.$6j);
            const mergeContent = (await fileService.readFile(testObject.conflicts.conflicts[0].previewResource)).value.toString();
            assert.strictEqual(mergeContent, '');
        }));
        test('sync profile settings', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const client2 = disposableStore.add(new userDataSyncClient_1.$W$b(server));
            await client2.setUp(true);
            const profile = await client2.instantiationService.get(userDataProfile_1.$Ek).createNamedProfile('profile1');
            await updateSettings(JSON.stringify({
                'a': 1,
                'b': 2,
            }), client2, profile);
            await client2.sync();
            await client.sync();
            assert.strictEqual(testObject.status, "idle" /* SyncStatus.Idle */);
            const syncedProfile = client.instantiationService.get(userDataProfile_1.$Ek).profiles.find(p => p.id === profile.id);
            const content = (await client.instantiationService.get(files_1.$6j).readFile(syncedProfile.settingsResource)).value.toString();
            assert.deepStrictEqual(JSON.parse(content), {
                'a': 1,
                'b': 2,
            });
        }));
    });
    suite('SettingsSync - Manual', () => {
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
            testObject = client.getSynchronizer("settings" /* SyncResource.Settings */);
        });
        test('do not sync ignored settings', () => (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const settingsContent = `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Editor
	"editor.fontFamily": "Fira Code",

	// Terminal
	"terminal.integrated.shell.osx": "some path",

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	]
}`;
            await updateSettings(settingsContent, client);
            let preview = await testObject.preview(await client.getResourceManifest(), {});
            assert.strictEqual(testObject.status, "syncing" /* SyncStatus.Syncing */);
            preview = await testObject.accept(preview.resourcePreviews[0].previewResource);
            preview = await testObject.apply(false);
            const { content } = await client.read(testObject.resource);
            assert.ok(content !== null);
            const actual = parseSettings(content);
            assert.deepStrictEqual(actual, `{
	// Always
	"files.autoSave": "afterDelay",
	"files.simpleDialog.enable": true,

	// Workbench
	"workbench.colorTheme": "GitHub Sharp",

	// Ignored
	"settingsSync.ignoredSettings": [
		"editor.fontFamily",
		"terminal.integrated.shell.osx"
	]
}`);
        }));
    });
    function parseSettings(content) {
        const syncData = JSON.parse(content);
        const settingsSyncContent = JSON.parse(syncData.content);
        return settingsSyncContent.settings;
    }
    async function updateSettings(content, client, profile) {
        await client.instantiationService.get(files_1.$6j).writeFile((profile ?? client.instantiationService.get(userDataProfile_1.$Ek).defaultProfile).settingsResource, buffer_1.$Fd.fromString(content));
        await client.instantiationService.get(configuration_1.$8h).reloadConfiguration();
    }
});
//# sourceMappingURL=settingsSync.test.js.map