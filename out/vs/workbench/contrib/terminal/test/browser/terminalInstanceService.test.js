/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/browser/contextKeyService", "vs/workbench/contrib/terminal/browser/terminalInstanceService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/test/browser/workbenchTestServices", "vs/base/test/common/utils"], function (require, exports, assert_1, uri_1, instantiationServiceMock_1, contextkey_1, contextKeyService_1, terminalInstanceService_1, configuration_1, testConfigurationService_1, environmentService_1, workbenchTestServices_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TerminalInstanceService', () => {
        let instantiationService;
        let terminalInstanceService;
        setup(async () => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            // TODO: Should be able to create these services without this config set
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService({
                terminal: {
                    integrated: {
                        fontWeight: 'normal'
                    }
                }
            }));
            instantiationService.stub(contextkey_1.IContextKeyService, instantiationService.createInstance(contextKeyService_1.ContextKeyService));
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, workbenchTestServices_1.TestEnvironmentService);
            terminalInstanceService = instantiationService.createInstance(terminalInstanceService_1.TerminalInstanceService);
        });
        teardown(() => {
            instantiationService.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('convertProfileToShellLaunchConfig', () => {
            test('should return an empty shell launch config when undefined is provided', () => {
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig(), {});
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig(undefined), {});
            });
            test('should return the same shell launch config when provided', () => {
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig({}), {});
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig({ executable: '/foo' }), { executable: '/foo' });
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig({ executable: '/foo', cwd: '/bar', args: ['a', 'b'] }), { executable: '/foo', cwd: '/bar', args: ['a', 'b'] });
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig({ executable: '/foo' }, '/bar'), { executable: '/foo', cwd: '/bar' });
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig({ executable: '/foo', cwd: '/bar' }, '/baz'), { executable: '/foo', cwd: '/baz' });
            });
            test('should convert a provided profile to a shell launch config', () => {
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig({
                    profileName: 'abc',
                    path: '/foo',
                    isDefault: true
                }), {
                    args: undefined,
                    color: undefined,
                    cwd: undefined,
                    env: undefined,
                    executable: '/foo',
                    icon: undefined,
                    name: undefined
                });
                const icon = uri_1.URI.file('/icon');
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig({
                    profileName: 'abc',
                    path: '/foo',
                    isDefault: true,
                    args: ['a', 'b'],
                    color: 'color',
                    env: { test: 'TEST' },
                    icon
                }, '/bar'), {
                    args: ['a', 'b'],
                    color: 'color',
                    cwd: '/bar',
                    env: { test: 'TEST' },
                    executable: '/foo',
                    icon,
                    name: undefined
                });
            });
            test('should respect overrideName in profile', () => {
                (0, assert_1.deepStrictEqual)(terminalInstanceService.convertProfileToShellLaunchConfig({
                    profileName: 'abc',
                    path: '/foo',
                    isDefault: true,
                    overrideName: true
                }), {
                    args: undefined,
                    color: undefined,
                    cwd: undefined,
                    env: undefined,
                    executable: '/foo',
                    icon: undefined,
                    name: 'abc'
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxJbnN0YW5jZVNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL3Rlc3QvYnJvd3Nlci90ZXJtaW5hbEluc3RhbmNlU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBZ0JoRyxLQUFLLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO1FBQ2pELElBQUksb0JBQThDLENBQUM7UUFDbkQsSUFBSSx1QkFBaUQsQ0FBQztRQUV0RCxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDaEIsb0JBQW9CLEdBQUcsSUFBSSxtREFBd0IsRUFBRSxDQUFDO1lBQ3RELHdFQUF3RTtZQUN4RSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMscUNBQXFCLEVBQUUsSUFBSSxtREFBd0IsQ0FBQztnQkFDN0UsUUFBUSxFQUFFO29CQUNULFVBQVUsRUFBRTt3QkFDWCxVQUFVLEVBQUUsUUFBUTtxQkFDcEI7aUJBQ0Q7YUFDRCxDQUFDLENBQUMsQ0FBQztZQUNKLG9CQUFvQixDQUFDLElBQUksQ0FBQywrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxjQUFjLENBQUMscUNBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQ3RHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxpREFBNEIsRUFBRSw4Q0FBc0IsQ0FBQyxDQUFDO1lBRWhGLHVCQUF1QixHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxpREFBdUIsQ0FBQyxDQUFDO1FBQ3hGLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLEVB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