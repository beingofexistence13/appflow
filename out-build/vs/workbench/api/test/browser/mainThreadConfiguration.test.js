/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/uri", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/workspace/common/workspace", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/api/browser/mainThreadConfiguration", "vs/workbench/api/test/common/testRPCProtocol", "vs/platform/configuration/common/configuration", "vs/workbench/services/configuration/browser/configurationService", "vs/platform/environment/common/environment"], function (require, exports, assert, sinon, uri_1, platform_1, configurationRegistry_1, workspace_1, instantiationServiceMock_1, mainThreadConfiguration_1, testRPCProtocol_1, configuration_1, configurationService_1, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadConfiguration', function () {
        const proxy = {
            $initializeConfiguration: () => { }
        };
        let instantiationService;
        let target;
        suiteSetup(() => {
            platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
                'id': 'extHostConfiguration',
                'title': 'a',
                'type': 'object',
                'properties': {
                    'extHostConfiguration.resource': {
                        'description': 'extHostConfiguration.resource',
                        'type': 'boolean',
                        'default': true,
                        'scope': 4 /* ConfigurationScope.RESOURCE */
                    },
                    'extHostConfiguration.window': {
                        'description': 'extHostConfiguration.resource',
                        'type': 'boolean',
                        'default': true,
                        'scope': 3 /* ConfigurationScope.WINDOW */
                    }
                }
            });
        });
        setup(() => {
            target = sinon.spy();
            instantiationService = new instantiationServiceMock_1.$L0b();
            instantiationService.stub(configuration_1.$8h, configurationService_1.$v2b);
            instantiationService.stub(configuration_1.$8h, 'onDidUpdateConfiguration', sinon.mock());
            instantiationService.stub(configuration_1.$8h, 'onDidChangeConfiguration', sinon.mock());
            instantiationService.stub(configuration_1.$8h, 'updateValue', target);
            instantiationService.stub(environment_1.$Ih, {
                isBuilt: false
            });
        });
        teardown(() => {
            instantiationService.dispose();
        });
        test('update resource configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update resource configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update resource configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in multi root workspace when resource is provided', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update resource configuration without configuration target defaults to folder', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, target.args[0][3]);
        });
        test('update configuration with user configuration target', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(2 /* ConfigurationTarget.USER */, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(2 /* ConfigurationTarget.USER */, target.args[0][3]);
        });
        test('update configuration with workspace configuration target', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(5 /* ConfigurationTarget.WORKSPACE */, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update configuration with folder configuration target', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$updateConfigurationOption(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, target.args[0][3]);
        });
        test('remove resource configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove resource configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove resource configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in multi root workspace when resource is provided', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove configuration without configuration target defaults to folder', function () {
            instantiationService.stub(workspace_1.$Kh, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.$zcb, (0, testRPCProtocol_1.$2dc)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, target.args[0][3]);
        });
    });
});
//# sourceMappingURL=mainThreadConfiguration.test.js.map