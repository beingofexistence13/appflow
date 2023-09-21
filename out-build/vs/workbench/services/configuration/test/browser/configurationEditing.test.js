/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon", "assert", "vs/base/common/json", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/platform/environment/common/environment", "vs/platform/workspace/common/workspace", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/uuid", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/configuration/browser/configurationService", "vs/workbench/services/configuration/common/configurationEditing", "vs/workbench/services/configuration/common/configuration", "vs/platform/configuration/common/configuration", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/services/resolverService", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/platform/notification/common/notification", "vs/platform/commands/common/commands", "vs/workbench/services/commands/common/commandService", "vs/base/common/uri", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/base/common/network", "vs/platform/files/common/files", "vs/workbench/services/keybinding/common/keybindingEditing", "vs/platform/userData/common/fileUserDataProvider", "vs/platform/uriIdentity/common/uriIdentityService", "vs/base/common/lifecycle", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/resources", "vs/base/common/buffer", "vs/workbench/services/remote/browser/remoteAgentService", "vs/workbench/services/workspaces/browser/workspaces", "vs/platform/userDataProfile/common/userDataProfile", "vs/base/common/hash", "vs/platform/policy/common/filePolicyService", "vs/base/test/common/timeTravelScheduler", "vs/workbench/services/userDataProfile/common/userDataProfileService"], function (require, exports, sinon, assert, json, event_1, platform_1, environment_1, workspace_1, workbenchTestServices_1, uuid, configurationRegistry_1, configurationService_1, configurationEditing_1, configuration_1, configuration_2, textfiles_1, resolverService_1, textModelResolverService_1, notification_1, commands_1, commandService_1, uri_1, remoteAgentService_1, fileService_1, log_1, network_1, files_1, keybindingEditing_1, fileUserDataProvider_1, uriIdentityService_1, lifecycle_1, inMemoryFilesystemProvider_1, resources_1, buffer_1, remoteAgentService_2, workspaces_1, userDataProfile_1, hash_1, filePolicyService_1, timeTravelScheduler_1, userDataProfileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
    class ConfigurationCache {
        needsCaching(resource) { return false; }
        async read() { return ''; }
        async write() { }
        async remove() { }
    }
    suite('ConfigurationEditing', () => {
        let instantiationService;
        let userDataProfileService;
        let environmentService;
        let fileService;
        let workspaceService;
        let testObject;
        const disposables = new lifecycle_1.$jc();
        suiteSetup(() => {
            const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
            configurationRegistry.registerConfiguration({
                'id': '_test',
                'type': 'object',
                'properties': {
                    'configurationEditing.service.testSetting': {
                        'type': 'string',
                        'default': 'isSet'
                    },
                    'configurationEditing.service.testSettingTwo': {
                        'type': 'string',
                        'default': 'isSet'
                    },
                    'configurationEditing.service.testSettingThree': {
                        'type': 'string',
                        'default': 'isSet'
                    },
                    'configurationEditing.service.policySetting': {
                        'type': 'string',
                        'default': 'isSet',
                        policy: {
                            name: 'configurationEditing.service.policySetting',
                            minimumVersion: '1.0.0',
                        }
                    }
                }
            });
        });
        setup(async () => {
            disposables.add((0, lifecycle_1.$ic)(() => sinon.restore()));
            const logService = new log_1.$fj();
            fileService = disposables.add(new fileService_1.$Dp(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.$rAb());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            const workspaceFolder = (0, resources_1.$ig)(ROOT, uuid.$4f());
            await fileService.createFolder(workspaceFolder);
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            environmentService = workbenchTestServices_1.$qec;
            environmentService.policyFile = (0, resources_1.$ig)(workspaceFolder, 'policies.json');
            instantiationService.stub(environment_1.$Ih, environmentService);
            const uriIdentityService = new uriIdentityService_1.$pr(fileService);
            const userDataProfilesService = instantiationService.stub(userDataProfile_1.$Ek, new userDataProfile_1.$Hk(environmentService, fileService, uriIdentityService, logService));
            userDataProfileService = new userDataProfileService_1.$I2b(userDataProfilesService.defaultProfile);
            const remoteAgentService = disposables.add(instantiationService.createInstance(remoteAgentService_2.$i2b));
            disposables.add(fileService.registerProvider(network_1.Schemas.vscodeUserData, disposables.add(new fileUserDataProvider_1.$n7b(ROOT.scheme, fileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService))));
            instantiationService.stub(files_1.$6j, fileService);
            instantiationService.stub(remoteAgentService_1.$jm, remoteAgentService);
            workspaceService = disposables.add(new configurationService_1.$v2b({ configurationCache: new ConfigurationCache() }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, new log_1.$fj(), new filePolicyService_1.$m7b(environmentService.policyFile, fileService, logService)));
            await workspaceService.initialize({
                id: (0, hash_1.$pi)(workspaceFolder.toString()).toString(16),
                uri: workspaceFolder
            });
            instantiationService.stub(workspace_1.$Kh, workspaceService);
            await workspaceService.initialize((0, workspaces_1.$tU)(workspaceFolder));
            instantiationService.stub(configuration_2.$8h, workspaceService);
            instantiationService.stub(keybindingEditing_1.$pyb, disposables.add(instantiationService.createInstance(keybindingEditing_1.$qyb)));
            instantiationService.stub(textfiles_1.$JD, disposables.add(instantiationService.createInstance(workbenchTestServices_1.$nec)));
            instantiationService.stub(resolverService_1.$uA, disposables.add(instantiationService.createInstance(textModelResolverService_1.$Jyb)));
            instantiationService.stub(commands_1.$Fr, commandService_1.$6yb);
            testObject = instantiationService.createInstance(configurationEditing_1.$o2b, null);
        });
        teardown(() => disposables.clear());
        test('errors cases - invalid key', async () => {
            try {
                await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'unknown.key', value: 'value' }, { donotNotifyError: true });
            }
            catch (error) {
                assert.strictEqual(error.code, 0 /* ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY */);
                return;
            }
            assert.fail('Should fail with ERROR_UNKNOWN_KEY');
        });
        test('errors cases - no workspace', async () => {
            await workspaceService.initialize({ id: uuid.$4f() });
            try {
                await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
            }
            catch (error) {
                assert.strictEqual(error.code, 8 /* ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED */);
                return;
            }
            assert.fail('Should fail with ERROR_NO_WORKSPACE_OPENED');
        });
        test('errors cases - invalid configuration', async () => {
            await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, buffer_1.$Fd.fromString(',,,,,,,,,,,,,,'));
            try {
                await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
            }
            catch (error) {
                assert.strictEqual(error.code, 11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */);
                return;
            }
            assert.fail('Should fail with ERROR_INVALID_CONFIGURATION');
        });
        test('errors cases - invalid global tasks configuration', async () => {
            const resource = (0, resources_1.$ig)(environmentService.userRoamingDataHome, configuration_1.$lE['tasks']);
            await fileService.writeFile(resource, buffer_1.$Fd.fromString(',,,,,,,,,,,,,,'));
            try {
                await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks.configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
            }
            catch (error) {
                assert.strictEqual(error.code, 11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */);
                return;
            }
            assert.fail('Should fail with ERROR_INVALID_CONFIGURATION');
        });
        test('errors cases - dirty', async () => {
            instantiationService.stub(textfiles_1.$JD, 'isDirty', true);
            try {
                await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
            }
            catch (error) {
                assert.strictEqual(error.code, 9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */);
                return;
            }
            assert.fail('Should fail with ERROR_CONFIGURATION_FILE_DIRTY error.');
        });
        test('do not notify error', async () => {
            instantiationService.stub(textfiles_1.$JD, 'isDirty', true);
            const target = sinon.stub();
            instantiationService.stub(notification_1.$Yu, { prompt: target, _serviceBrand: undefined, doNotDisturbMode: false, onDidAddNotification: undefined, onDidRemoveNotification: undefined, onDidChangeDoNotDisturbMode: undefined, notify: null, error: null, info: null, warn: null, status: null });
            try {
                await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: 'value' }, { donotNotifyError: true });
            }
            catch (error) {
                assert.strictEqual(false, target.calledOnce);
                assert.strictEqual(error.code, 9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */);
                return;
            }
            assert.fail('Should fail with ERROR_CONFIGURATION_FILE_DIRTY error.');
        });
        test('errors cases - ERROR_POLICY_CONFIGURATION', async () => {
            await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
                const promise = event_1.Event.toPromise(instantiationService.get(configuration_2.$8h).onDidChangeConfiguration);
                await fileService.writeFile(environmentService.policyFile, buffer_1.$Fd.fromString('{ "configurationEditing.service.policySetting": "policyValue" }'));
                await promise;
            });
            try {
                await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.policySetting', value: 'value' }, { donotNotifyError: true });
            }
            catch (error) {
                assert.strictEqual(error.code, 12 /* ConfigurationEditingErrorCode.ERROR_POLICY_CONFIGURATION */);
                return;
            }
            assert.fail('Should fail with ERROR_POLICY_CONFIGURATION');
        });
        test('write policy setting - when not set', async () => {
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.policySetting', value: 'value' }, { donotNotifyError: true });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['configurationEditing.service.policySetting'], 'value');
        });
        test('write one setting - empty file', async () => {
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['configurationEditing.service.testSetting'], 'value');
        });
        test('write one setting - existing file', async () => {
            await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, buffer_1.$Fd.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['configurationEditing.service.testSetting'], 'value');
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('remove an existing setting - existing file', async () => {
            await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, buffer_1.$Fd.fromString('{ "my.super.setting": "my.super.value", "configurationEditing.service.testSetting": "value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: undefined });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.$Lm(contents.value.toString());
            assert.deepStrictEqual(Object.keys(parsed), ['my.super.setting']);
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('remove non existing setting - existing file', async () => {
            await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, buffer_1.$Fd.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: undefined });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.$Lm(contents.value.toString());
            assert.deepStrictEqual(Object.keys(parsed), ['my.super.setting']);
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('write overridable settings to user settings', async () => {
            const key = '[language]';
            const value = { 'configurationEditing.service.testSetting': 'overridden value' };
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key, value });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.$Lm(contents.value.toString());
            assert.deepStrictEqual(parsed[key], value);
        });
        test('write overridable settings to workspace settings', async () => {
            const key = '[language]';
            const value = { 'configurationEditing.service.testSetting': 'overridden value' };
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key, value });
            const contents = await fileService.readFile((0, resources_1.$ig)(workspaceService.getWorkspace().folders[0].uri, configuration_1.$5D));
            const parsed = json.$Lm(contents.value.toString());
            assert.deepStrictEqual(parsed[key], value);
        });
        test('write overridable settings to workspace folder settings', async () => {
            const key = '[language]';
            const value = { 'configurationEditing.service.testSetting': 'overridden value' };
            const folderSettingsFile = (0, resources_1.$ig)(workspaceService.getWorkspace().folders[0].uri, configuration_1.$5D);
            await testObject.writeConfiguration(4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */, { key, value }, { scopes: { resource: folderSettingsFile } });
            const contents = await fileService.readFile(folderSettingsFile);
            const parsed = json.$Lm(contents.value.toString());
            assert.deepStrictEqual(parsed[key], value);
        });
        test('write workspace standalone setting - empty file', async () => {
            const target = (0, resources_1.$ig)(workspaceService.getWorkspace().folders[0].uri, configuration_1.$kE['tasks']);
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['service.testSetting'], 'value');
        });
        test('write user standalone setting - empty file', async () => {
            const target = (0, resources_1.$ig)(environmentService.userRoamingDataHome, configuration_1.$lE['tasks']);
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['service.testSetting'], 'value');
        });
        test('write workspace standalone setting - existing file', async () => {
            const target = (0, resources_1.$ig)(workspaceService.getWorkspace().folders[0].uri, configuration_1.$kE['tasks']);
            await fileService.writeFile(target, buffer_1.$Fd.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['service.testSetting'], 'value');
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('write user standalone setting - existing file', async () => {
            const target = (0, resources_1.$ig)(environmentService.userRoamingDataHome, configuration_1.$lE['tasks']);
            await fileService.writeFile(target, buffer_1.$Fd.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['service.testSetting'], 'value');
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('write workspace standalone setting - empty file - full JSON', async () => {
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const target = (0, resources_1.$ig)(workspaceService.getWorkspace().folders[0].uri, configuration_1.$kE['tasks']);
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write user standalone setting - empty file - full JSON', async () => {
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const target = (0, resources_1.$ig)(environmentService.userRoamingDataHome, configuration_1.$lE['tasks']);
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write workspace standalone setting - existing file - full JSON', async () => {
            const target = (0, resources_1.$ig)(workspaceService.getWorkspace().folders[0].uri, configuration_1.$kE['tasks']);
            await fileService.writeFile(target, buffer_1.$Fd.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write user standalone setting - existing file - full JSON', async () => {
            const target = (0, resources_1.$ig)(environmentService.userRoamingDataHome, configuration_1.$lE['tasks']);
            await fileService.writeFile(target, buffer_1.$Fd.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write workspace standalone setting - existing file with JSON errors - full JSON', async () => {
            const target = (0, resources_1.$ig)(workspaceService.getWorkspace().folders[0].uri, configuration_1.$kE['tasks']);
            await fileService.writeFile(target, buffer_1.$Fd.fromString('{ "my.super.setting": ')); // invalid JSON
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write user standalone setting - existing file with JSON errors - full JSON', async () => {
            const target = (0, resources_1.$ig)(environmentService.userRoamingDataHome, configuration_1.$lE['tasks']);
            await fileService.writeFile(target, buffer_1.$Fd.fromString('{ "my.super.setting": ')); // invalid JSON
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const contents = await fileService.readFile(target);
            const parsed = json.$Lm(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write workspace standalone setting should replace complete file', async () => {
            const target = (0, resources_1.$ig)(workspaceService.getWorkspace().folders[0].uri, configuration_1.$kE['tasks']);
            await fileService.writeFile(target, buffer_1.$Fd.fromString(`{
			"version": "1.0.0",
			"tasks": [
				{
					"taskName": "myTask1"
				},
				{
					"taskName": "myTask2"
				}
			]
		}`));
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] } });
            const actual = await fileService.readFile(target);
            const expected = JSON.stringify({ 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] }, null, '\t');
            assert.strictEqual(actual.value.toString(), expected);
        });
        test('write user standalone setting should replace complete file', async () => {
            const target = (0, resources_1.$ig)(environmentService.userRoamingDataHome, configuration_1.$lE['tasks']);
            await fileService.writeFile(target, buffer_1.$Fd.fromString(`{
			"version": "1.0.0",
			"tasks": [
				{
					"taskName": "myTask1"
				},
				{
					"taskName": "myTask2"
				}
			]
		}`));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] } });
            const actual = await fileService.readFile(target);
            const expected = JSON.stringify({ 'version': '1.0.0', tasks: [{ 'taskName': 'myTask1' }] }, null, '\t');
            assert.strictEqual(actual.value.toString(), expected);
        });
    });
});
//# sourceMappingURL=configurationEditing.test.js.map