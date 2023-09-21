define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/workbench/services/configuration/common/configurationModels", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/map", "vs/platform/workspace/common/workspace", "vs/base/common/uri", "vs/platform/workspace/test/common/testWorkspace"], function (require, exports, assert, platform_1, configurationModels_1, configurationModels_2, configurationRegistry_1, map_1, workspace_1, uri_1, testWorkspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('FolderSettingsModelParser', () => {
        suiteSetup(() => {
            const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                'id': 'FolderSettingsModelParser_1',
                'type': 'object',
                'properties': {
                    'FolderSettingsModelParser.window': {
                        'type': 'string',
                        'default': 'isSet'
                    },
                    'FolderSettingsModelParser.resource': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: 4 /* ConfigurationScope.RESOURCE */,
                    },
                    'FolderSettingsModelParser.resourceLanguage': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                    },
                    'FolderSettingsModelParser.application': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: 1 /* ConfigurationScope.APPLICATION */
                    },
                    'FolderSettingsModelParser.machine': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: 2 /* ConfigurationScope.MACHINE */
                    }
                }
            });
        });
        test('parse all folder settings', () => {
            const testObject = new configurationModels_2.ConfigurationModelParser('settings');
            testObject.parse(JSON.stringify({ 'FolderSettingsModelParser.window': 'window', 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.application': 'application', 'FolderSettingsModelParser.machine': 'executable' }), { scopes: [4 /* ConfigurationScope.RESOURCE */, 3 /* ConfigurationScope.WINDOW */] });
            const expected = Object.create(null);
            expected['FolderSettingsModelParser'] = Object.create(null);
            expected['FolderSettingsModelParser']['window'] = 'window';
            expected['FolderSettingsModelParser']['resource'] = 'resource';
            assert.deepStrictEqual(testObject.configurationModel.contents, expected);
        });
        test('parse resource folder settings', () => {
            const testObject = new configurationModels_2.ConfigurationModelParser('settings');
            testObject.parse(JSON.stringify({ 'FolderSettingsModelParser.window': 'window', 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.application': 'application', 'FolderSettingsModelParser.machine': 'executable' }), { scopes: [4 /* ConfigurationScope.RESOURCE */] });
            const expected = Object.create(null);
            expected['FolderSettingsModelParser'] = Object.create(null);
            expected['FolderSettingsModelParser']['resource'] = 'resource';
            assert.deepStrictEqual(testObject.configurationModel.contents, expected);
        });
        test('parse resource and resource language settings', () => {
            const testObject = new configurationModels_2.ConfigurationModelParser('settings');
            testObject.parse(JSON.stringify({ '[json]': { 'FolderSettingsModelParser.window': 'window', 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.resourceLanguage': 'resourceLanguage', 'FolderSettingsModelParser.application': 'application', 'FolderSettingsModelParser.machine': 'executable' } }), { scopes: [4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */] });
            const expected = Object.create(null);
            expected['FolderSettingsModelParser'] = Object.create(null);
            expected['FolderSettingsModelParser']['resource'] = 'resource';
            expected['FolderSettingsModelParser']['resourceLanguage'] = 'resourceLanguage';
            assert.deepStrictEqual(testObject.configurationModel.overrides, [{ 'contents': expected, 'identifiers': ['json'], 'keys': ['FolderSettingsModelParser.resource', 'FolderSettingsModelParser.resourceLanguage'] }]);
        });
        test('reparse folder settings excludes application and machine setting', () => {
            const parseOptions = { scopes: [4 /* ConfigurationScope.RESOURCE */, 3 /* ConfigurationScope.WINDOW */] };
            const testObject = new configurationModels_2.ConfigurationModelParser('settings');
            testObject.parse(JSON.stringify({ 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.anotherApplicationSetting': 'executable' }), parseOptions);
            let expected = Object.create(null);
            expected['FolderSettingsModelParser'] = Object.create(null);
            expected['FolderSettingsModelParser']['resource'] = 'resource';
            expected['FolderSettingsModelParser']['anotherApplicationSetting'] = 'executable';
            assert.deepStrictEqual(testObject.configurationModel.contents, expected);
            const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
            configurationRegistry.registerConfiguration({
                'id': 'FolderSettingsModelParser_2',
                'type': 'object',
                'properties': {
                    'FolderSettingsModelParser.anotherApplicationSetting': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: 1 /* ConfigurationScope.APPLICATION */
                    },
                    'FolderSettingsModelParser.anotherMachineSetting': {
                        'type': 'string',
                        'default': 'isSet',
                        scope: 2 /* ConfigurationScope.MACHINE */
                    }
                }
            });
            testObject.reparse(parseOptions);
            expected = Object.create(null);
            expected['FolderSettingsModelParser'] = Object.create(null);
            expected['FolderSettingsModelParser']['resource'] = 'resource';
            assert.deepStrictEqual(testObject.configurationModel.contents, expected);
        });
    });
    suite('StandaloneConfigurationModelParser', () => {
        test('parse tasks stand alone configuration model', () => {
            const testObject = new configurationModels_1.StandaloneConfigurationModelParser('tasks', 'tasks');
            testObject.parse(JSON.stringify({ 'version': '1.1.1', 'tasks': [] }));
            const expected = Object.create(null);
            expected['tasks'] = Object.create(null);
            expected['tasks']['version'] = '1.1.1';
            expected['tasks']['tasks'] = [];
            assert.deepStrictEqual(testObject.configurationModel.contents, expected);
        });
    });
    suite('Workspace Configuration', () => {
        const defaultConfigurationModel = toConfigurationModel({
            'editor.lineNumbers': 'on',
            'editor.fontSize': 12,
            'window.zoomLevel': 1,
            '[markdown]': {
                'editor.wordWrap': 'off'
            },
            'window.title': 'custom',
            'workbench.enableTabs': false,
            'editor.insertSpaces': true
        });
        test('Test compare same configurations', () => {
            const workspace = new testWorkspace_1.Workspace('a', [new workspace_1.WorkspaceFolder({ index: 0, name: 'a', uri: uri_1.URI.file('folder1') }), new workspace_1.WorkspaceFolder({ index: 1, name: 'b', uri: uri_1.URI.file('folder2') }), new workspace_1.WorkspaceFolder({ index: 2, name: 'c', uri: uri_1.URI.file('folder3') })]);
            const configuration1 = new configurationModels_1.Configuration(new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new map_1.ResourceMap(), new configurationModels_2.ConfigurationModel(), new map_1.ResourceMap(), workspace);
            configuration1.updateDefaultConfiguration(defaultConfigurationModel);
            configuration1.updateLocalUserConfiguration(toConfigurationModel({ 'window.title': 'native', '[typescript]': { 'editor.insertSpaces': false } }));
            configuration1.updateWorkspaceConfiguration(toConfigurationModel({ 'editor.lineNumbers': 'on' }));
            configuration1.updateFolderConfiguration(uri_1.URI.file('folder1'), toConfigurationModel({ 'editor.fontSize': 14 }));
            configuration1.updateFolderConfiguration(uri_1.URI.file('folder2'), toConfigurationModel({ 'editor.wordWrap': 'on' }));
            const configuration2 = new configurationModels_1.Configuration(new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new map_1.ResourceMap(), new configurationModels_2.ConfigurationModel(), new map_1.ResourceMap(), workspace);
            configuration2.updateDefaultConfiguration(defaultConfigurationModel);
            configuration2.updateLocalUserConfiguration(toConfigurationModel({ 'window.title': 'native', '[typescript]': { 'editor.insertSpaces': false } }));
            configuration2.updateWorkspaceConfiguration(toConfigurationModel({ 'editor.lineNumbers': 'on' }));
            configuration2.updateFolderConfiguration(uri_1.URI.file('folder1'), toConfigurationModel({ 'editor.fontSize': 14 }));
            configuration2.updateFolderConfiguration(uri_1.URI.file('folder2'), toConfigurationModel({ 'editor.wordWrap': 'on' }));
            const actual = configuration2.compare(configuration1);
            assert.deepStrictEqual(actual, { keys: [], overrides: [] });
        });
        test('Test compare different configurations', () => {
            const workspace = new testWorkspace_1.Workspace('a', [new workspace_1.WorkspaceFolder({ index: 0, name: 'a', uri: uri_1.URI.file('folder1') }), new workspace_1.WorkspaceFolder({ index: 1, name: 'b', uri: uri_1.URI.file('folder2') }), new workspace_1.WorkspaceFolder({ index: 2, name: 'c', uri: uri_1.URI.file('folder3') })]);
            const configuration1 = new configurationModels_1.Configuration(new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new map_1.ResourceMap(), new configurationModels_2.ConfigurationModel(), new map_1.ResourceMap(), workspace);
            configuration1.updateDefaultConfiguration(defaultConfigurationModel);
            configuration1.updateLocalUserConfiguration(toConfigurationModel({ 'window.title': 'native', '[typescript]': { 'editor.insertSpaces': false } }));
            configuration1.updateWorkspaceConfiguration(toConfigurationModel({ 'editor.lineNumbers': 'on' }));
            configuration1.updateFolderConfiguration(uri_1.URI.file('folder1'), toConfigurationModel({ 'editor.fontSize': 14 }));
            configuration1.updateFolderConfiguration(uri_1.URI.file('folder2'), toConfigurationModel({ 'editor.wordWrap': 'on' }));
            const configuration2 = new configurationModels_1.Configuration(new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new configurationModels_2.ConfigurationModel(), new map_1.ResourceMap(), new configurationModels_2.ConfigurationModel(), new map_1.ResourceMap(), workspace);
            configuration2.updateDefaultConfiguration(defaultConfigurationModel);
            configuration2.updateLocalUserConfiguration(toConfigurationModel({ 'workbench.enableTabs': true, '[typescript]': { 'editor.insertSpaces': true } }));
            configuration2.updateWorkspaceConfiguration(toConfigurationModel({ 'editor.fontSize': 11 }));
            configuration2.updateFolderConfiguration(uri_1.URI.file('folder1'), toConfigurationModel({ 'editor.insertSpaces': true }));
            configuration2.updateFolderConfiguration(uri_1.URI.file('folder2'), toConfigurationModel({
                '[markdown]': {
                    'editor.wordWrap': 'on',
                    'editor.lineNumbers': 'relative'
                },
            }));
            const actual = configuration2.compare(configuration1);
            assert.deepStrictEqual(actual, { keys: ['editor.wordWrap', 'editor.fontSize', '[markdown]', 'window.title', 'workbench.enableTabs', '[typescript]'], overrides: [['markdown', ['editor.lineNumbers', 'editor.wordWrap']], ['typescript', ['editor.insertSpaces']]] });
        });
    });
    function toConfigurationModel(obj) {
        const parser = new configurationModels_2.ConfigurationModelParser('test');
        parser.parse(JSON.stringify(obj));
        return parser.configurationModel;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbk1vZGVscy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2NvbmZpZ3VyYXRpb24vdGVzdC9jb21tb24vY29uZmlndXJhdGlvbk1vZGVscy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLEtBQUssQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7UUFFdkMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNmLE1BQU0scUJBQXFCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3pHLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDO2dCQUMzQyxJQUFJLEVBQUUsNkJBQTZCO2dCQUNuQyxNQUFNLEVBQUUsUUFBUTtnQkFDaEIsWUFBWSxFQUFFO29CQUNiLGtDQUFrQyxFQUFFO3dCQUNuQyxNQUFNLEVBQUUsUUFBUTt3QkFDaEIsU0FBUyxFQUFFLE9BQU87cUJBQ2xCO29CQUNELG9DQUFvQyxFQUFFO3dCQUNyQyxNQUFNLEVBQUUsUUFBUTt3QkFDaEIsU0FBUyxFQUFFLE9BQU87d0JBQ2xCLEtBQUsscUNBQTZCO3FCQUNsQztvQkFDRCw0Q0FBNEMsRUFBRTt3QkFDN0MsTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLFNBQVMsRUFBRSxPQUFPO3dCQUNsQixLQUFLLGlEQUF5QztxQkFDOUM7b0JBQ0QsdUNBQXVDLEVBQUU7d0JBQ3hDLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixTQUFTLEVBQUUsT0FBTzt3QkFDbEIsS0FBSyx3Q0FBZ0M7cUJBQ3JDO29CQUNELG1DQUFtQyxFQUFFO3dCQUNwQyxNQUFNLEVBQUUsUUFBUTt3QkFDaEIsU0FBUyxFQUFFLE9BQU87d0JBQ2xCLEtBQUssb0NBQTRCO3FCQUNqQztpQkFDRDthQUNELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFD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