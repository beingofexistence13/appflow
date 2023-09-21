/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/configuration/common/configuration", "vs/editor/common/services/textResourceConfigurationService", "vs/base/common/uri", "vs/base/test/common/utils"], function (require, exports, assert, testConfigurationService_1, instantiationServiceMock_1, model_1, language_1, configuration_1, textResourceConfigurationService_1, uri_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TextResourceConfigurationService - Update', () => {
        const disposables = (0, utils_1.$bT)();
        let instantiationService;
        let configurationValue = {};
        let updateArgs;
        const configurationService = new class extends testConfigurationService_1.$G0b {
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
            instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(model_1.$yA, { getModel() { return null; } });
            instantiationService.stub(language_1.$ct, { guessLanguageIdByFilepathOrFirstLine() { return language; } });
            instantiationService.stub(configuration_1.$8h, configurationService);
            testObject = disposables.add(instantiationService.createInstance(textResourceConfigurationService_1.$NBb));
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
//# sourceMappingURL=textResourceConfigurationService.test.js.map