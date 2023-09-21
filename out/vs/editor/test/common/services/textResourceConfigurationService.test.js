/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/configuration/common/configuration", "vs/editor/common/services/textResourceConfigurationService", "vs/base/common/uri", "vs/base/test/common/utils"], function (require, exports, assert, testConfigurationService_1, instantiationServiceMock_1, model_1, language_1, configuration_1, textResourceConfigurationService_1, uri_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TextResourceConfigurationService - Update', () => {
        const disposables = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        let configurationValue = {};
        let updateArgs;
        const configurationService = new class extends testConfigurationService_1.TestConfigurationService {
            inspect() {
                return configurationValue;
            }
            updateValue() {
                updateArgs = [...arguments];
                return Promise.resolve();
            }
        }();
        let language = null;
        let testObject;
        setup(() => {
            instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(model_1.IModelService, { getModel() { return null; } });
            instantiationService.stub(language_1.ILanguageService, { guessLanguageIdByFilepathOrFirstLine() { return language; } });
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            testObject = disposables.add(instantiationService.createInstance(textResourceConfigurationService_1.TextResourceConfigurationService));
        });
        test('updateValue writes without target and overrides when no language is defined', async () => {
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 3 /* ConfigurationTarget.USER_LOCAL */]);
        });
        test('updateValue writes with target and without overrides when no language is defined', async () => {
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 3 /* ConfigurationTarget.USER_LOCAL */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 3 /* ConfigurationTarget.USER_LOCAL */]);
        });
        test('updateValue writes into given memory target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '1' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 8 /* ConfigurationTarget.MEMORY */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 8 /* ConfigurationTarget.MEMORY */]);
        });
        test('updateValue writes into given workspace target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 5 /* ConfigurationTarget.WORKSPACE */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 5 /* ConfigurationTarget.WORKSPACE */]);
        });
        test('updateValue writes into given user target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 2 /* ConfigurationTarget.USER */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 2 /* ConfigurationTarget.USER */]);
        });
        test('updateValue writes into given workspace folder target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '2', override: '1' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */]);
        });
        test('updateValue writes into derived workspace folder target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */]);
        });
        test('updateValue writes into derived workspace folder target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspace: { value: '2', override: '1' },
                workspaceFolder: { value: '2', override: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */]);
        });
        test('updateValue writes into derived workspace target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspace: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 5 /* ConfigurationTarget.WORKSPACE */]);
        });
        test('updateValue writes into derived workspace target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspace: { value: '2', override: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 5 /* ConfigurationTarget.WORKSPACE */]);
        });
        test('updateValue writes into derived workspace target with overrides and value defined in folder', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1', override: '3' },
                userLocal: { value: '2' },
                workspace: { value: '2', override: '2' },
                workspaceFolder: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 5 /* ConfigurationTarget.WORKSPACE */]);
        });
        test('updateValue writes into derived user remote target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                userRemote: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 4 /* ConfigurationTarget.USER_REMOTE */]);
        });
        test('updateValue writes into derived user remote target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                userRemote: { value: '2', override: '3' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 4 /* ConfigurationTarget.USER_REMOTE */]);
        });
        test('updateValue writes into derived user remote target with overrides and value defined in workspace', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                userRemote: { value: '2', override: '3' },
                workspace: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 4 /* ConfigurationTarget.USER_REMOTE */]);
        });
        test('updateValue writes into derived user remote target with overrides and value defined in workspace folder', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2', override: '1' },
                userRemote: { value: '2', override: '3' },
                workspace: { value: '3' },
                workspaceFolder: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 4 /* ConfigurationTarget.USER_REMOTE */]);
        });
        test('updateValue writes into derived user target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 3 /* ConfigurationTarget.USER_LOCAL */]);
        });
        test('updateValue writes into derived user target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2', override: '3' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', '2');
            assert.deepStrictEqual(updateArgs, ['a', '2', { resource, overrideIdentifier: language }, 3 /* ConfigurationTarget.USER_LOCAL */]);
        });
        test('updateValue writes into derived user target with overrides and value is defined in remote', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2', override: '3' },
                userRemote: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', '2');
            assert.deepStrictEqual(updateArgs, ['a', '2', { resource, overrideIdentifier: language }, 3 /* ConfigurationTarget.USER_LOCAL */]);
        });
        test('updateValue writes into derived user target with overrides and value is defined in workspace', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2', override: '3' },
                workspaceValue: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', '2');
            assert.deepStrictEqual(updateArgs, ['a', '2', { resource, overrideIdentifier: language }, 3 /* ConfigurationTarget.USER_LOCAL */]);
        });
        test('updateValue writes into derived user target with overrides and value is defined in workspace folder', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1', override: '3' },
                userLocal: { value: '2', override: '3' },
                userRemote: { value: '3' },
                workspaceFolderValue: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', '2');
            assert.deepStrictEqual(updateArgs, ['a', '2', { resource, overrideIdentifier: language }, 3 /* ConfigurationTarget.USER_LOCAL */]);
        });
        test('updateValue when not changed', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 3 /* ConfigurationTarget.USER_LOCAL */]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFJlc291cmNlQ29uZmlndXJhdGlvblNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9zZXJ2aWNlcy90ZXh0UmVzb3VyY2VDb25maWd1cmF0aW9uU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLEtBQUssQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7UUFFdkQsTUFBTSxXQUFXLEdBQUcsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTlELElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSxrQkFBa0IsR0FBNkIsRUFBRSxDQUFDO1FBQ3RELElBQUksVUFBaUIsQ0FBQztRQUN0QixNQUFNLG9CQUFvQixHQUFHLElBQUksS0FBTSxTQUFRLG1EQUF3QjtZQUM3RCxPQUFPO2dCQUNmLE9BQU8sa0JBQWtCLENBQUM7WUFDM0IsQ0FBQztZQUNRLFdBQVc7Z0JBQ25CLFVBQVUsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBQzVCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzFCLENBQUM7U0FDRCxFQUFFLENBQUM7UUFDSixJQUFJLFFBQVEsR0FBa0IsSUFBSSxDQUFDO1FBQ25DLElBQUksVUFBNEMsQ0FBQztRQUVqRCxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1Ysb0JBQW9CLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQztZQUN2RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMscUJBQWEsRUFBMEIsRUFBRSxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xHLG9CQUFvQixDQUFDLElBQUksQ0FBQywyQkFBZ0IsRUFBNkIsRUFBRSxvQ0FBb0MsS0FBSyxPQUFP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