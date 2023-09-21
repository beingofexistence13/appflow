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
            platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
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
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(configuration_1.IConfigurationService, configurationService_1.WorkspaceService);
            instantiationService.stub(configuration_1.IConfigurationService, 'onDidUpdateConfiguration', sinon.mock());
            instantiationService.stub(configuration_1.IConfigurationService, 'onDidChangeConfiguration', sinon.mock());
            instantiationService.stub(configuration_1.IConfigurationService, 'updateValue', target);
            instantiationService.stub(environment_1.IEnvironmentService, {
                isBuilt: false
            });
        });
        teardown(() => {
            instantiationService.dispose();
        });
        test('update resource configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update resource configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update resource configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in multi root workspace when resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update window configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.window', 'value', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update resource configuration without configuration target defaults to folder', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(null, 'extHostConfiguration.resource', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, target.args[0][3]);
        });
        test('update configuration with user configuration target', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(2 /* ConfigurationTarget.USER */, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(2 /* ConfigurationTarget.USER */, target.args[0][3]);
        });
        test('update configuration with workspace configuration target', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(5 /* ConfigurationTarget.WORKSPACE */, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('update configuration with folder configuration target', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$updateConfigurationOption(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, 'extHostConfiguration.window', 'value', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, target.args[0][3]);
        });
        test('remove resource configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove resource configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove resource configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in multi root workspace when no resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in multi root workspace when resource is provided', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in folder workspace when resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove window configuration without configuration target defaults to workspace in folder workspace when no resource is provider', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 2 /* WorkbenchState.FOLDER */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.window', undefined, undefined);
            assert.strictEqual(5 /* ConfigurationTarget.WORKSPACE */, target.args[0][3]);
        });
        test('remove configuration without configuration target defaults to folder', function () {
            instantiationService.stub(workspace_1.IWorkspaceContextService, { getWorkbenchState: () => 3 /* WorkbenchState.WORKSPACE */ });
            const testObject = instantiationService.createInstance(mainThreadConfiguration_1.MainThreadConfiguration, (0, testRPCProtocol_1.SingleProxyRPCProtocol)(proxy));
            testObject.$removeConfigurationOption(null, 'extHostConfiguration.resource', { resource: uri_1.URI.file('abc') }, undefined);
            assert.strictEqual(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, target.args[0][3]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENvbmZpZ3VyYXRpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvdGVzdC9icm93c2VyL21haW5UaHJlYWRDb25maWd1cmF0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFlaEcsS0FBSyxDQUFDLHlCQUF5QixFQUFFO1FBRWhDLE1BQU0sS0FBSyxHQUFHO1lBQ2Isd0JBQXdCLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztTQUNuQyxDQUFDO1FBQ0YsSUFBSSxvQkFBOEMsQ0FBQztRQUNuRCxJQUFJLE1BQXNCLENBQUM7UUFFM0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNmLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO2dCQUNuRixJQUFJLEVBQUUsc0JBQXNCO2dCQUM1QixPQUFPLEVBQUUsR0FBRztnQkFDWixNQUFNLEVBQUUsUUFBUTtnQkFDaEIsWUFBWSxFQUFFO29CQUNiLCtCQUErQixFQUFFO3dCQUNoQyxhQUFhLEVBQUUsK0JBQStCO3dCQUM5QyxNQUFNLEVBQUUsU0FBUzt3QkFDakIsU0FBUyxFQUFFLElBQUk7d0JBQ2YsT0FBTyxxQ0FBNkI7cUJBQ3BDO29CQUNELDZCQUE2QixFQUFFO3dCQUM5QixhQUFhLEVBQUUsK0JBQStCO3dCQUM5QyxNQUFNLEVBQUUsU0FBUzt3QkFDakIsU0FBUyxFQUFFLElBQUk7d0JBQ2YsT0FBTyxtQ0FBMkI7cUJBQ2xDO2lCQUNEO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUVyQixvQkFBb0IsR0FBRyxJQUFJLG1EQUF3QixFQUFFLENBQUM7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