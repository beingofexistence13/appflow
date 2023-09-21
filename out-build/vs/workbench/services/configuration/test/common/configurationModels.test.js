define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/workbench/services/configuration/common/configurationModels", "vs/platform/configuration/common/configurationModels", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/map", "vs/platform/workspace/common/workspace", "vs/base/common/uri", "vs/platform/workspace/test/common/testWorkspace"], function (require, exports, assert, platform_1, configurationModels_1, configurationModels_2, configurationRegistry_1, map_1, workspace_1, uri_1, testWorkspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('FolderSettingsModelParser', () => {
        suiteSetup(() => {
            const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
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
            const testObject = new configurationModels_2.$rn('settings');
            testObject.parse(JSON.stringify({ 'FolderSettingsModelParser.window': 'window', 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.application': 'application', 'FolderSettingsModelParser.machine': 'executable' }), { scopes: [4 /* ConfigurationScope.RESOURCE */, 3 /* ConfigurationScope.WINDOW */] });
            const expected = Object.create(null);
            expected['FolderSettingsModelParser'] = Object.create(null);
            expected['FolderSettingsModelParser']['window'] = 'window';
            expected['FolderSettingsModelParser']['resource'] = 'resource';
            assert.deepStrictEqual(testObject.configurationModel.contents, expected);
        });
        test('parse resource folder settings', () => {
            const testObject = new configurationModels_2.$rn('settings');
            testObject.parse(JSON.stringify({ 'FolderSettingsModelParser.window': 'window', 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.application': 'application', 'FolderSettingsModelParser.machine': 'executable' }), { scopes: [4 /* ConfigurationScope.RESOURCE */] });
            const expected = Object.create(null);
            expected['FolderSettingsModelParser'] = Object.create(null);
            expected['FolderSettingsModelParser']['resource'] = 'resource';
            assert.deepStrictEqual(testObject.configurationModel.contents, expected);
        });
        test('parse resource and resource language settings', () => {
            const testObject = new configurationModels_2.$rn('settings');
            testObject.parse(JSON.stringify({ '[json]': { 'FolderSettingsModelParser.window': 'window', 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.resourceLanguage': 'resourceLanguage', 'FolderSettingsModelParser.application': 'application', 'FolderSettingsModelParser.machine': 'executable' } }), { scopes: [4 /* ConfigurationScope.RESOURCE */, 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */] });
            const expected = Object.create(null);
            expected['FolderSettingsModelParser'] = Object.create(null);
            expected['FolderSettingsModelParser']['resource'] = 'resource';
            expected['FolderSettingsModelParser']['resourceLanguage'] = 'resourceLanguage';
            assert.deepStrictEqual(testObject.configurationModel.overrides, [{ 'contents': expected, 'identifiers': ['json'], 'keys': ['FolderSettingsModelParser.resource', 'FolderSettingsModelParser.resourceLanguage'] }]);
        });
        test('reparse folder settings excludes application and machine setting', () => {
            const parseOptions = { scopes: [4 /* ConfigurationScope.RESOURCE */, 3 /* ConfigurationScope.WINDOW */] };
            const testObject = new configurationModels_2.$rn('settings');
            testObject.parse(JSON.stringify({ 'FolderSettingsModelParser.resource': 'resource', 'FolderSettingsModelParser.anotherApplicationSetting': 'executable' }), parseOptions);
            let expected = Object.create(null);
            expected['FolderSettingsModelParser'] = Object.create(null);
            expected['FolderSettingsModelParser']['resource'] = 'resource';
            expected['FolderSettingsModelParser']['anotherApplicationSetting'] = 'executable';
            assert.deepStrictEqual(testObject.configurationModel.contents, expected);
            const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
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
            const testObject = new configurationModels_1.$l2b('tasks', 'tasks');
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
            const workspace = new testWorkspace_1.$00b('a', [new workspace_1.$Vh({ index: 0, name: 'a', uri: uri_1.URI.file('folder1') }), new workspace_1.$Vh({ index: 1, name: 'b', uri: uri_1.URI.file('folder2') }), new workspace_1.$Vh({ index: 2, name: 'c', uri: uri_1.URI.file('folder3') })]);
            const configuration1 = new configurationModels_1.$m2b(new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new map_1.$zi(), new configurationModels_2.$qn(), new map_1.$zi(), workspace);
            configuration1.updateDefaultConfiguration(defaultConfigurationModel);
            configuration1.updateLocalUserConfiguration(toConfigurationModel({ 'window.title': 'native', '[typescript]': { 'editor.insertSpaces': false } }));
            configuration1.updateWorkspaceConfiguration(toConfigurationModel({ 'editor.lineNumbers': 'on' }));
            configuration1.updateFolderConfiguration(uri_1.URI.file('folder1'), toConfigurationModel({ 'editor.fontSize': 14 }));
            configuration1.updateFolderConfiguration(uri_1.URI.file('folder2'), toConfigurationModel({ 'editor.wordWrap': 'on' }));
            const configuration2 = new configurationModels_1.$m2b(new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new map_1.$zi(), new configurationModels_2.$qn(), new map_1.$zi(), workspace);
            configuration2.updateDefaultConfiguration(defaultConfigurationModel);
            configuration2.updateLocalUserConfiguration(toConfigurationModel({ 'window.title': 'native', '[typescript]': { 'editor.insertSpaces': false } }));
            configuration2.updateWorkspaceConfiguration(toConfigurationModel({ 'editor.lineNumbers': 'on' }));
            configuration2.updateFolderConfiguration(uri_1.URI.file('folder1'), toConfigurationModel({ 'editor.fontSize': 14 }));
            configuration2.updateFolderConfiguration(uri_1.URI.file('folder2'), toConfigurationModel({ 'editor.wordWrap': 'on' }));
            const actual = configuration2.compare(configuration1);
            assert.deepStrictEqual(actual, { keys: [], overrides: [] });
        });
        test('Test compare different configurations', () => {
            const workspace = new testWorkspace_1.$00b('a', [new workspace_1.$Vh({ index: 0, name: 'a', uri: uri_1.URI.file('folder1') }), new workspace_1.$Vh({ index: 1, name: 'b', uri: uri_1.URI.file('folder2') }), new workspace_1.$Vh({ index: 2, name: 'c', uri: uri_1.URI.file('folder3') })]);
            const configuration1 = new configurationModels_1.$m2b(new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new map_1.$zi(), new configurationModels_2.$qn(), new map_1.$zi(), workspace);
            configuration1.updateDefaultConfiguration(defaultConfigurationModel);
            configuration1.updateLocalUserConfiguration(toConfigurationModel({ 'window.title': 'native', '[typescript]': { 'editor.insertSpaces': false } }));
            configuration1.updateWorkspaceConfiguration(toConfigurationModel({ 'editor.lineNumbers': 'on' }));
            configuration1.updateFolderConfiguration(uri_1.URI.file('folder1'), toConfigurationModel({ 'editor.fontSize': 14 }));
            configuration1.updateFolderConfiguration(uri_1.URI.file('folder2'), toConfigurationModel({ 'editor.wordWrap': 'on' }));
            const configuration2 = new configurationModels_1.$m2b(new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new configurationModels_2.$qn(), new map_1.$zi(), new configurationModels_2.$qn(), new map_1.$zi(), workspace);
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
        const parser = new configurationModels_2.$rn('test');
        parser.parse(JSON.stringify(obj));
        return parser.configurationModel;
    }
});
//# sourceMappingURL=configurationModels.test.js.map