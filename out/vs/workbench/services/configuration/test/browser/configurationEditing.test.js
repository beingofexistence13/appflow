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
        const disposables = new lifecycle_1.DisposableStore();
        suiteSetup(() => {
            const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
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
            disposables.add((0, lifecycle_1.toDisposable)(() => sinon.restore()));
            const logService = new log_1.NullLogService();
            fileService = disposables.add(new fileService_1.FileService(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            const workspaceFolder = (0, resources_1.joinPath)(ROOT, uuid.generateUuid());
            await fileService.createFolder(workspaceFolder);
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)(undefined, disposables);
            environmentService = workbenchTestServices_1.TestEnvironmentService;
            environmentService.policyFile = (0, resources_1.joinPath)(workspaceFolder, 'policies.json');
            instantiationService.stub(environment_1.IEnvironmentService, environmentService);
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            const userDataProfilesService = instantiationService.stub(userDataProfile_1.IUserDataProfilesService, new userDataProfile_1.UserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
            userDataProfileService = new userDataProfileService_1.UserDataProfileService(userDataProfilesService.defaultProfile);
            const remoteAgentService = disposables.add(instantiationService.createInstance(remoteAgentService_2.RemoteAgentService));
            disposables.add(fileService.registerProvider(network_1.Schemas.vscodeUserData, disposables.add(new fileUserDataProvider_1.FileUserDataProvider(ROOT.scheme, fileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesService, uriIdentityService, logService))));
            instantiationService.stub(files_1.IFileService, fileService);
            instantiationService.stub(remoteAgentService_1.IRemoteAgentService, remoteAgentService);
            workspaceService = disposables.add(new configurationService_1.WorkspaceService({ configurationCache: new ConfigurationCache() }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, new log_1.NullLogService(), new filePolicyService_1.FilePolicyService(environmentService.policyFile, fileService, logService)));
            await workspaceService.initialize({
                id: (0, hash_1.hash)(workspaceFolder.toString()).toString(16),
                uri: workspaceFolder
            });
            instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceService);
            await workspaceService.initialize((0, workspaces_1.getSingleFolderWorkspaceIdentifier)(workspaceFolder));
            instantiationService.stub(configuration_2.IConfigurationService, workspaceService);
            instantiationService.stub(keybindingEditing_1.IKeybindingEditingService, disposables.add(instantiationService.createInstance(keybindingEditing_1.KeybindingsEditingService)));
            instantiationService.stub(textfiles_1.ITextFileService, disposables.add(instantiationService.createInstance(workbenchTestServices_1.TestTextFileService)));
            instantiationService.stub(resolverService_1.ITextModelService, disposables.add(instantiationService.createInstance(textModelResolverService_1.TextModelResolverService)));
            instantiationService.stub(commands_1.ICommandService, commandService_1.CommandService);
            testObject = instantiationService.createInstance(configurationEditing_1.ConfigurationEditing, null);
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
            await workspaceService.initialize({ id: uuid.generateUuid() });
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
            await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, buffer_1.VSBuffer.fromString(',,,,,,,,,,,,,,'));
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
            const resource = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, configuration_1.USER_STANDALONE_CONFIGURATIONS['tasks']);
            await fileService.writeFile(resource, buffer_1.VSBuffer.fromString(',,,,,,,,,,,,,,'));
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
            instantiationService.stub(textfiles_1.ITextFileService, 'isDirty', true);
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
            instantiationService.stub(textfiles_1.ITextFileService, 'isDirty', true);
            const target = sinon.stub();
            instantiationService.stub(notification_1.INotificationService, { prompt: target, _serviceBrand: undefined, doNotDisturbMode: false, onDidAddNotification: undefined, onDidRemoveNotification: undefined, onDidChangeDoNotDisturbMode: undefined, notify: null, error: null, info: null, warn: null, status: null });
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
            await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
                const promise = event_1.Event.toPromise(instantiationService.get(configuration_2.IConfigurationService).onDidChangeConfiguration);
                await fileService.writeFile(environmentService.policyFile, buffer_1.VSBuffer.fromString('{ "configurationEditing.service.policySetting": "policyValue" }'));
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
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['configurationEditing.service.policySetting'], 'value');
        });
        test('write one setting - empty file', async () => {
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['configurationEditing.service.testSetting'], 'value');
        });
        test('write one setting - existing file', async () => {
            await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, buffer_1.VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['configurationEditing.service.testSetting'], 'value');
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('remove an existing setting - existing file', async () => {
            await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, buffer_1.VSBuffer.fromString('{ "my.super.setting": "my.super.value", "configurationEditing.service.testSetting": "value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: undefined });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.parse(contents.value.toString());
            assert.deepStrictEqual(Object.keys(parsed), ['my.super.setting']);
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('remove non existing setting - existing file', async () => {
            await fileService.writeFile(userDataProfileService.currentProfile.settingsResource, buffer_1.VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'configurationEditing.service.testSetting', value: undefined });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.parse(contents.value.toString());
            assert.deepStrictEqual(Object.keys(parsed), ['my.super.setting']);
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('write overridable settings to user settings', async () => {
            const key = '[language]';
            const value = { 'configurationEditing.service.testSetting': 'overridden value' };
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key, value });
            const contents = await fileService.readFile(userDataProfileService.currentProfile.settingsResource);
            const parsed = json.parse(contents.value.toString());
            assert.deepStrictEqual(parsed[key], value);
        });
        test('write overridable settings to workspace settings', async () => {
            const key = '[language]';
            const value = { 'configurationEditing.service.testSetting': 'overridden value' };
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key, value });
            const contents = await fileService.readFile((0, resources_1.joinPath)(workspaceService.getWorkspace().folders[0].uri, configuration_1.FOLDER_SETTINGS_PATH));
            const parsed = json.parse(contents.value.toString());
            assert.deepStrictEqual(parsed[key], value);
        });
        test('write overridable settings to workspace folder settings', async () => {
            const key = '[language]';
            const value = { 'configurationEditing.service.testSetting': 'overridden value' };
            const folderSettingsFile = (0, resources_1.joinPath)(workspaceService.getWorkspace().folders[0].uri, configuration_1.FOLDER_SETTINGS_PATH);
            await testObject.writeConfiguration(4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */, { key, value }, { scopes: { resource: folderSettingsFile } });
            const contents = await fileService.readFile(folderSettingsFile);
            const parsed = json.parse(contents.value.toString());
            assert.deepStrictEqual(parsed[key], value);
        });
        test('write workspace standalone setting - empty file', async () => {
            const target = (0, resources_1.joinPath)(workspaceService.getWorkspace().folders[0].uri, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['service.testSetting'], 'value');
        });
        test('write user standalone setting - empty file', async () => {
            const target = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, configuration_1.USER_STANDALONE_CONFIGURATIONS['tasks']);
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['service.testSetting'], 'value');
        });
        test('write workspace standalone setting - existing file', async () => {
            const target = (0, resources_1.joinPath)(workspaceService.getWorkspace().folders[0].uri, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
            await fileService.writeFile(target, buffer_1.VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['service.testSetting'], 'value');
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('write user standalone setting - existing file', async () => {
            const target = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, configuration_1.USER_STANDALONE_CONFIGURATIONS['tasks']);
            await fileService.writeFile(target, buffer_1.VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks.service.testSetting', value: 'value' });
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['service.testSetting'], 'value');
            assert.strictEqual(parsed['my.super.setting'], 'my.super.value');
        });
        test('write workspace standalone setting - empty file - full JSON', async () => {
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const target = (0, resources_1.joinPath)(workspaceService.getWorkspace().folders[0].uri, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write user standalone setting - empty file - full JSON', async () => {
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const target = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, configuration_1.USER_STANDALONE_CONFIGURATIONS['tasks']);
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write workspace standalone setting - existing file - full JSON', async () => {
            const target = (0, resources_1.joinPath)(workspaceService.getWorkspace().folders[0].uri, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
            await fileService.writeFile(target, buffer_1.VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write user standalone setting - existing file - full JSON', async () => {
            const target = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, configuration_1.USER_STANDALONE_CONFIGURATIONS['tasks']);
            await fileService.writeFile(target, buffer_1.VSBuffer.fromString('{ "my.super.setting": "my.super.value" }'));
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write workspace standalone setting - existing file with JSON errors - full JSON', async () => {
            const target = (0, resources_1.joinPath)(workspaceService.getWorkspace().folders[0].uri, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
            await fileService.writeFile(target, buffer_1.VSBuffer.fromString('{ "my.super.setting": ')); // invalid JSON
            await testObject.writeConfiguration(3 /* EditableConfigurationTarget.WORKSPACE */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write user standalone setting - existing file with JSON errors - full JSON', async () => {
            const target = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, configuration_1.USER_STANDALONE_CONFIGURATIONS['tasks']);
            await fileService.writeFile(target, buffer_1.VSBuffer.fromString('{ "my.super.setting": ')); // invalid JSON
            await testObject.writeConfiguration(1 /* EditableConfigurationTarget.USER_LOCAL */, { key: 'tasks', value: { 'version': '1.0.0', tasks: [{ 'taskName': 'myTask' }] } });
            const contents = await fileService.readFile(target);
            const parsed = json.parse(contents.value.toString());
            assert.strictEqual(parsed['version'], '1.0.0');
            assert.strictEqual(parsed['tasks'][0]['taskName'], 'myTask');
        });
        test('write workspace standalone setting should replace complete file', async () => {
            const target = (0, resources_1.joinPath)(workspaceService.getWorkspace().folders[0].uri, configuration_1.WORKSPACE_STANDALONE_CONFIGURATIONS['tasks']);
            await fileService.writeFile(target, buffer_1.VSBuffer.fromString(`{
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
            const target = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, configuration_1.USER_STANDALONE_CONFIGURATIONS['tasks']);
            await fileService.writeFile(target, buffer_1.VSBuffer.fromString(`{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbkVkaXRpbmcudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jb25maWd1cmF0aW9uL3Rlc3QvYnJvd3Nlci9jb25maWd1cmF0aW9uRWRpdGluZy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBOENoRyxNQUFNLElBQUksR0FBRyxTQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBRWhFLE1BQU0sa0JBQWtCO1FBQ3ZCLFlBQVksQ0FBQyxRQUFhLElBQWEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RELEtBQUssQ0FBQyxJQUFJLEtBQXNCLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM1QyxLQUFLLENBQUMsS0FBSyxLQUFvQixDQUFDO1FBQ2hDLEtBQUssQ0FBQyxNQUFNLEtBQW9CLENBQUM7S0FDakM7SUFFRCxLQUFLLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1FBRWxDLElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxzQkFBK0MsQ0FBQztRQUNwRCxJQUFJLGtCQUF1RCxDQUFDO1FBQzVELElBQUksV0FBeUIsQ0FBQztRQUM5QixJQUFJLGdCQUFrQyxDQUFDO1FBQ3ZDLElBQUksVUFBZ0MsQ0FBQztRQUVyQyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUUxQyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2YsTUFBTSxxQkFBcUIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQXVCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDekcscUJBQXFCLENBQUMscUJBQXFCLENBQUM7Z0JBQzNDLElBQUksRUFBRSxPQUFPO2dCQUNiLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixZQUFZLEVBQUU7b0JBQ2IsMENBQTBDLEVBQUU7d0JBQzNDLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixTQUFTLEVBQUUsT0FBTztxQkFDbEI7b0JBQ0QsNkNBQTZDLEVBQUU7d0JBQzlDLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixTQUFTLEVBQUUsT0FBTztxQkFDbEI7b0JBQ0QsK0NBQStDLEVBQUU7d0JBQ2hELE1BQU0sRUFBRSxRQUFRO3dCQUNoQixTQUFTLEVBQUUsT0FBTztxQkFDbEI7b0JBQ0QsNENBQTRDLEVBQUU7d0JBQzdDLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixTQUFTLEVBQUUsT0FBTzt3QkFDbEIsTUFBTSxFQUFFOzRCQUNQLElBQUksRUFBRSw0Q0FBNEM7NEJBQ2xELGNBQWMsRUFBRSxPQUFPO3lCQUN2QjtxQkFDRDtpQkFDRDthQUNELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ2hCLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckQsTUFBTSxVQUFVLEdBQUcsSUFBSSxvQkFBYyxFQUFFLENBQUM7WUFDeEMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSx5QkFBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDM0QsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksdURBQTBCLEVBQUUsQ0FBQyxDQUFDO1lBQzdFLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBRS9FLE1BQU0sZUFBZSxHQUFHLElBQUEsb0JBQVEsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7WUFDNUQsTUFBTSxXQUFXLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRWhELG9CQUFvQixHQUE2QixJQUFBLHFEQUE2QixFQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN2RyxrQkFBa0IsR0FBRyw4Q0FBc0IsQ0FBQztZQUM1QyxrQkFBa0IsQ0FBQyxVQUFVLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMzRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsaUNBQW1CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNuRSxNQUFNLGtCQUFrQixHQUFHLElBQUksdUNBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0QsTUFBTSx1QkFBdUIsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsMENBQXdCLEVBQUUsSUFBSSx5Q0FBdUIsQ0FBQyxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNsTCxzQkFBc0IsR0FBRyxJQUFJLCtDQUFzQixDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzVGLE1BQU0sa0JBQWtCLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsdUNBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLGlCQUFPLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSwyQ0FBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGtCQUFrQixFQUFFLGlCQUFPLENBQUMsY0FBYyxFQUFFLHVCQUF1QixFQUFFLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25PLG9CQUFvQixDQUFDLElBQUksQ0FBQyxvQkFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3JELG9CQUFvQixDQUFDLElBQUksQ0FBQyx3Q0FBbUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ25FLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSx1Q0FBZ0IsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLElBQUksa0JBQWtCLEVBQUUsRUFBRSxFQUFFLGtCQUFrQixFQUFFLHNCQUFzQixFQUFFLHVCQUF1QixFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLG9CQUFjLEVBQUUsRUFBRSxJQUFJLHFDQUFpQixDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFVLE1BQU0sZ0JBQWdCLENBQUMsVUFBVSxDQUFDO2dCQUNqQyxFQUFFLEVBQUUsSUFBQSxXQUFJLEVBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDakQsR0FBRyxFQUFFLGVBQWU7YUFDcEIsQ0FBQyxDQUFDO1lBQ0gsb0JBQW9CLENBQUMsSUFBSSxDQUFDLG9DQUF3QixFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFdEUsTUFBTSxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBQSwrQ0FBa0MsRUFBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLG9CQUFvQixDQUFDLElBQUksQ0FBQyxxQ0FBcUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ25FLG9CQUFvQixDQUFDLElBQUksQ0FBQyw2Q0FBeUIsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyw2Q0FBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0SSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsNEJBQWdCLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsMkNBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkgsb0JBQW9CLENBQUMsSUFBSSxDQUFDLG1DQUFpQixFQUFxQixXQUFXLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxtREFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoSixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsMEJBQWUsRUFBRSwrQkFBYyxDQUFDLENBQUM7WUFDM0QsVUFBVSxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQywyQ0FBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RSxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUVwQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDN0MsSUFBSTtnQkFDSCxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsZ0RBQXdDLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQy9JO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSwwREFBa0QsQ0FBQztnQkFDaEYsT0FBTzthQUNQO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzlDLE1BQU0sZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDL0QsSUFBSTtnQkFDSCxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsZ0RBQXdDLEVBQUUsR0FBRyxFQUFFLDBDQUEwQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDNUs7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLGtFQUEwRCxDQUFDO2dCQUN4RixPQUFPO2FBQ1A7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsc0NBQXNDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdkQsTUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDM0gsSUFBSTtnQkFDSCxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsaURBQXlDLEVBQUUsR0FBRyxFQUFFLDBDQUEwQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDN0s7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLHFFQUE0RCxDQUFDO2dCQUMxRixPQUFPO2FBQ1A7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFDN0QsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbURBQW1ELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDcEUsTUFBTSxRQUFRLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGtCQUFrQixDQUFDLG1CQUFtQixFQUFFLDhDQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0csTUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDN0UsSUFBSTtnQkFDSCxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsaURBQXlDLEVBQUUsR0FBRyxFQUFFLGdEQUFnRCxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDbkw7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLHFFQUE0RCxDQUFDO2dCQUMxRixPQUFPO2FBQ1A7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFDN0QsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdkMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLDRCQUFnQixFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3RCxJQUFJO2dCQUNILE1BQU0sVUFBVSxDQUFDLGtCQUFrQixpREFBeUMsRUFBRSxHQUFHLEVBQUUsMENBQTBDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUM3SztZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksdUVBQStELENBQUM7Z0JBQzdGLE9BQU87YUFDUDtZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsd0RBQXdELENBQUMsQ0FBQztRQUN2RSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN0QyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsNEJBQWdCLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM1QixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsbUNBQW9CLEVBQXdCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxTQUFVLEVBQUUsdUJBQXVCLEVBQUUsU0FBVSxFQUFFLDJCQUEyQixFQUFFLFNBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSyxFQUFFLEtBQUssRUFBRSxJQUFLLEVBQUUsSUFBSSxFQUFFLElBQUssRUFBRSxJQUFJLEVBQUUsSUFBSyxFQUFFLE1BQU0sRUFBRSxJQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ25VLElBQUk7Z0JBQ0gsTUFBTSxVQUFVLENBQUMsa0JBQWtCLGlEQUF5QyxFQUFFLEdBQUcsRUFBRSwwQ0FBMEMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzdLO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLHVFQUErRCxDQUFDO2dCQUM3RixPQUFPO2FBQ1A7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLHdEQUF3RCxDQUFDLENBQUM7UUFDdkUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDNUQsTUFBTSxJQUFBLHdDQUFrQixFQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUM1RCxNQUFNLE9BQU8sR0FBRyxhQUFLLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUM7Z0JBQzFHLE1BQU0sV0FBVyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFXLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsaUVBQWlFLENBQUMsQ0FBQyxDQUFDO2dCQUNwSixNQUFNLE9BQU8sQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSTtnQkFDSCxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsaURBQXlDLEVBQUUsR0FBRyxFQUFFLDRDQUE0QyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDL0s7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLG9FQUEyRCxDQUFDO2dCQUN6RixPQUFPO2FBQ1A7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUNBQXFDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdEQsTUFBTSxVQUFVLENBQUMsa0JBQWtCLGlEQUF5QyxFQUFFLEdBQUcsRUFBRSw0Q0FBNEMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQy9LLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyw0Q0FBNEMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25GLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2pELE1BQU0sVUFBVSxDQUFDLGtCQUFrQixpREFBeUMsRUFBRSxHQUFHLEVBQUUsMENBQTBDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDakosTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3BHLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDcEQsTUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUM7WUFDckosTUFBTSxVQUFVLENBQUMsa0JBQWtCLGlEQUF5QyxFQUFFLEdBQUcsRUFBRSwwQ0FBMEMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUVqSixNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDcEcsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsMENBQTBDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoRixNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNENBQTRDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDN0QsTUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQywrRkFBK0YsQ0FBQyxDQUFDLENBQUM7WUFDMU0sTUFBTSxVQUFVLENBQUMsa0JBQWtCLGlEQUF5QyxFQUFFLEdBQUcsRUFBRSwwQ0FBMEMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUVuSixNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDcEcsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw2Q0FBNkMsRUFBRSxLQUFLLElBQUksRUFBRTtZQUM5RCxNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLGdCQUFnQixFQUFFLGlCQUFRLENBQUMsVUFBVSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQztZQUNySixNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsaURBQXlDLEVBQUUsR0FBRyxFQUFFLDBDQUEwQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBRW5KLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDZDQUE2QyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzlELE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQztZQUN6QixNQUFNLEtBQUssR0FBRyxFQUFFLDBDQUEwQyxFQUFFLGtCQUFrQixFQUFFLENBQUM7WUFDakYsTUFBTSxVQUFVLENBQUMsa0JBQWtCLGlEQUF5QyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBRTVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrREFBa0QsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNuRSxNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUM7WUFDekIsTUFBTSxLQUFLLEdBQUcsRUFBRSwwQ0FBMEMsRUFBRSxrQkFBa0IsRUFBRSxDQUFDO1lBQ2pGLE1BQU0sVUFBVSxDQUFDLGtCQUFrQixnREFBd0MsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUUzRixNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBQSxvQkFBUSxFQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsb0NBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQzVILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlEQUF5RCxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzFFLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQztZQUN6QixNQUFNLEtBQUssR0FBRyxFQUFFLDBDQUEwQyxFQUFFLGtCQUFrQixFQUFFLENBQUM7WUFDakYsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLG9CQUFRLEVBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxvQ0FBb0IsQ0FBQyxDQUFDO1lBQzFHLE1BQU0sVUFBVSxDQUFDLGtCQUFrQix1REFBK0MsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFaEosTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaURBQWlELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDbEUsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsbURBQW1DLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0SCxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsZ0RBQXdDLEVBQUUsR0FBRyxFQUFFLDJCQUEyQixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRWpJLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDRDQUE0QyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzdELE1BQU0sTUFBTSxHQUFHLElBQUEsb0JBQVEsRUFBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsRUFBRSw4Q0FBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3pHLE1BQU0sVUFBVSxDQUFDLGtCQUFrQixpREFBeUMsRUFBRSxHQUFHLEVBQUUsMkJBQTJCLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFbEksTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsb0RBQW9ELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDckUsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsbURBQW1DLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0SCxNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLGlCQUFRLENBQUMsVUFBVSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQztZQUVyRyxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsZ0RBQXdDLEVBQUUsR0FBRyxFQUFFLDJCQUEyQixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRWpJLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywrQ0FBK0MsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNoRSxNQUFNLE1BQU0sR0FBRyxJQUFBLG9CQUFRLEVBQUMsa0JBQWtCLENBQUMsbUJBQW1CLEVBQUUsOENBQThCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN6RyxNQUFNLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLGlCQUFRLENBQUMsVUFBVSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQztZQUVyRyxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsaURBQXlDLEVBQUUsR0FBRyxFQUFFLDJCQUEyQixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRWxJLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw2REFBNkQsRUFBRSxLQUFLLElBQUksRUFBRTtZQUM5RSxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsZ0RBQXdDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFL0osTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsbURBQW1DLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0SCxNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0RBQXdELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDekUsTUFBTSxVQUFVLENBQUMsa0JBQWtCLGlEQUF5QyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWhLLE1BQU0sTUFBTSxHQUFHLElBQUEsb0JBQVEsRUFBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsRUFBRSw4Q0FBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3pHLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnRUFBZ0UsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNqRixNQUFNLE1BQU0sR0FBRyxJQUFBLG9CQUFRLEVBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxtREFBbUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3RILE1BQU0sV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDO1lBRXJHLE1BQU0sVUFBVSxDQUFDLGtCQUFrQixnREFBd0MsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUUvSixNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMkRBQTJELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDNUUsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGtCQUFrQixDQUFDLG1CQUFtQixFQUFFLDhDQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDekcsTUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUM7WUFFckcsTUFBTSxVQUFVLENBQUMsa0JBQWtCLGlEQUF5QyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWhLLE1BQU0sUUFBUSxHQUFHLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxpRkFBaUYsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNsRyxNQUFNLE1BQU0sR0FBRyxJQUFBLG9CQUFRLEVBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxtREFBbUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3RILE1BQU0sV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZTtZQUVuRyxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsZ0RBQXdDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFL0osTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDRFQUE0RSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzdGLE1BQU0sTUFBTSxHQUFHLElBQUEsb0JBQVEsRUFBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsRUFBRSw4Q0FBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3pHLE1BQU0sV0FBVyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZTtZQUVuRyxNQUFNLFVBQVUsQ0FBQyxrQkFBa0IsaURBQXlDLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFaEssTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGlFQUFpRSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2xGLE1BQU0sTUFBTSxHQUFHLElBQUEsb0JBQVEsRUFBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLG1EQUFtQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEgsTUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQzs7Ozs7Ozs7OztJQVV0RCxDQUFDLENBQUMsQ0FBQztZQUVMLE1BQU0sVUFBVSxDQUFDLGtCQUFrQixnREFBd0MsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVoSyxNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4RyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNERBQTRELEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDN0UsTUFBTSxNQUFNLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGtCQUFrQixDQUFDLG1CQUFtQixFQUFFLDhDQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDekcsTUFBTSxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQzs7Ozs7Ozs7OztJQVV0RCxDQUFDLENBQUMsQ0FBQztZQUVMLE1BQU0sVUFBVSxDQUFDLGtCQUFrQixpREFBeUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVqSyxNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4RyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9