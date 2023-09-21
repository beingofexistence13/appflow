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
            instantiationService = new instantiationServiceMock_1.$L0b();
            // TODO: Should be able to create these services without this config set
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b({
                terminal: {
                    integrated: {
                        fontWeight: 'normal'
                    }
                }
            }));
            instantiationService.stub(contextkey_1.$3i, instantiationService.createInstance(contextKeyService_1.$xtb));
            instantiationService.stub(environmentService_1.$hJ, workbenchTestServices_1.$qec);
            terminalInstanceService = instantiationService.createInstance(terminalInstanceService_1.$eWb);
        });
        teardown(() => {
            instantiationService.dispose();
        });
        (0, utils_1.$bT)();
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
//# sourceMappingURL=terminalInstanceService.test.js.map