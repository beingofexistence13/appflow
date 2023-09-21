/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/workbench/contrib/terminal/browser/terminalInstance", "vs/platform/workspace/common/workspace", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/services/search/test/browser/queryBuilder.test", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/base/common/uri", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/base/common/network", "vs/workbench/test/browser/workbenchTestServices", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert_1, platform_1, terminalInstance_1, workspace_1, testWorkspace_1, instantiationServiceMock_1, workbenchTestServices_1, queryBuilder_test_1, testConfigurationService_1, terminalConfigHelper_1, uri_1, terminalCapabilityStore_1, network_1, workbenchTestServices_2, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const root1 = '/foo/root1';
    const ROOT_1 = (0, queryBuilder_test_1.$4fc)(root1);
    const root2 = '/foo/root2';
    const ROOT_2 = (0, queryBuilder_test_1.$4fc)(root2);
    const emptyRoot = '/foo';
    const ROOT_EMPTY = (0, queryBuilder_test_1.$4fc)(emptyRoot);
    suite('Workbench - TerminalInstance', () => {
        (0, utils_1.$bT)();
        suite('parseExitResult', () => {
            test('should return no message for exit code = undefined', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(undefined, {}, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: undefined, message: undefined });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(undefined, {}, 5 /* ProcessState.KilledByUser */, undefined), { code: undefined, message: undefined });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(undefined, {}, 6 /* ProcessState.KilledByProcess */, undefined), { code: undefined, message: undefined });
            });
            test('should return no message for exit code = 0', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(0, {}, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: 0, message: undefined });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(0, {}, 5 /* ProcessState.KilledByUser */, undefined), { code: 0, message: undefined });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(0, {}, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: 0, message: undefined });
            });
            test('should return friendly message when executable is specified for non-zero exit codes', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(1, { executable: 'foo' }, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: 1, message: 'The terminal process "foo" failed to launch (exit code: 1).' });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(1, { executable: 'foo' }, 5 /* ProcessState.KilledByUser */, undefined), { code: 1, message: 'The terminal process "foo" terminated with exit code: 1.' });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(1, { executable: 'foo' }, 6 /* ProcessState.KilledByProcess */, undefined), { code: 1, message: 'The terminal process "foo" terminated with exit code: 1.' });
            });
            test('should return friendly message when executable and args are specified for non-zero exit codes', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(1, { executable: 'foo', args: ['bar', 'baz'] }, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: 1, message: `The terminal process "foo 'bar', 'baz'" failed to launch (exit code: 1).` });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(1, { executable: 'foo', args: ['bar', 'baz'] }, 5 /* ProcessState.KilledByUser */, undefined), { code: 1, message: `The terminal process "foo 'bar', 'baz'" terminated with exit code: 1.` });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(1, { executable: 'foo', args: ['bar', 'baz'] }, 6 /* ProcessState.KilledByProcess */, undefined), { code: 1, message: `The terminal process "foo 'bar', 'baz'" terminated with exit code: 1.` });
            });
            test('should return friendly message when executable and arguments are omitted for non-zero exit codes', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(1, {}, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: 1, message: `The terminal process failed to launch (exit code: 1).` });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(1, {}, 5 /* ProcessState.KilledByUser */, undefined), { code: 1, message: `The terminal process terminated with exit code: 1.` });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)(1, {}, 6 /* ProcessState.KilledByProcess */, undefined), { code: 1, message: `The terminal process terminated with exit code: 1.` });
            });
            test('should ignore pty host-related errors', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)({ message: 'Could not find pty with id 16' }, {}, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: undefined, message: undefined });
            });
            test('should format conpty failure code 5', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)({ code: 5, message: 'A native exception occurred during launch (Cannot create process, error code: 5)' }, { executable: 'foo' }, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: 5, message: `The terminal process failed to launch: Access was denied to the path containing your executable "foo". Manage and change your permissions to get this to work.` });
            });
            test('should format conpty failure code 267', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)({ code: 267, message: 'A native exception occurred during launch (Cannot create process, error code: 267)' }, {}, 4 /* ProcessState.KilledDuringLaunch */, '/foo'), { code: 267, message: `The terminal process failed to launch: Invalid starting directory "/foo", review your terminal.integrated.cwd setting.` });
            });
            test('should format conpty failure code 1260', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)({ code: 1260, message: 'A native exception occurred during launch (Cannot create process, error code: 1260)' }, { executable: 'foo' }, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: 1260, message: `The terminal process failed to launch: Windows cannot open this program because it has been prevented by a software restriction policy. For more information, open Event Viewer or contact your system Administrator.` });
            });
            test('should format generic failures', () => {
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)({ code: 123, message: 'A native exception occurred during launch (Cannot create process, error code: 123)' }, {}, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: 123, message: `The terminal process failed to launch: A native exception occurred during launch (Cannot create process, error code: 123).` });
                (0, assert_1.deepStrictEqual)((0, terminalInstance_1.$aWb)({ code: 123, message: 'foo' }, {}, 4 /* ProcessState.KilledDuringLaunch */, undefined), { code: 123, message: `The terminal process failed to launch: foo.` });
            });
        });
        suite('TerminalLabelComputer', () => {
            let store;
            let configurationService;
            let terminalLabelComputer;
            let instantiationService;
            let mockContextService;
            let mockMultiRootContextService;
            let emptyContextService;
            let mockWorkspace;
            let mockMultiRootWorkspace;
            let emptyWorkspace;
            let capabilities;
            let configHelper;
            function createInstance(partial) {
                const capabilities = store.add(new terminalCapabilityStore_1.$eib());
                if (!platform_1.$i) {
                    capabilities.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
                }
                return {
                    shellLaunchConfig: {},
                    cwd: 'cwd',
                    initialCwd: undefined,
                    processName: '',
                    sequence: undefined,
                    workspaceFolder: undefined,
                    staticTitle: undefined,
                    capabilities,
                    title: '',
                    description: '',
                    userHome: undefined,
                    ...partial
                };
            }
            setup(async () => {
                store = new lifecycle_1.$jc();
                instantiationService = store.add(new instantiationServiceMock_1.$L0b());
                instantiationService.stub(workspace_1.$Kh, new workbenchTestServices_1.$6dc());
                capabilities = store.add(new terminalCapabilityStore_1.$eib());
                if (!platform_1.$i) {
                    capabilities.add(1 /* TerminalCapability.NaiveCwdDetection */, null);
                }
                const ROOT_1_URI = (0, queryBuilder_test_1.$3fc)(ROOT_1);
                mockContextService = new workbenchTestServices_1.$6dc();
                mockWorkspace = new testWorkspace_1.$00b('workspace', [(0, workspace_1.$Wh)(ROOT_1_URI)]);
                mockContextService.setWorkspace(mockWorkspace);
                const ROOT_2_URI = (0, queryBuilder_test_1.$3fc)(ROOT_2);
                mockMultiRootContextService = new workbenchTestServices_1.$6dc();
                mockMultiRootWorkspace = new testWorkspace_1.$00b('multi-root-workspace', [(0, workspace_1.$Wh)(ROOT_1_URI), (0, workspace_1.$Wh)(ROOT_2_URI)]);
                mockMultiRootContextService.setWorkspace(mockMultiRootWorkspace);
                const ROOT_EMPTY_URI = (0, queryBuilder_test_1.$3fc)(ROOT_EMPTY);
                emptyContextService = new workbenchTestServices_1.$6dc();
                emptyWorkspace = new testWorkspace_1.$00b('empty workspace', [], ROOT_EMPTY_URI);
                emptyContextService.setWorkspace(emptyWorkspace);
            });
            teardown(() => store.dispose());
            test('should resolve to "" when the template variables are empty', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' - ', title: '', description: '' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: '' }));
                // TODO:
                // terminalLabelComputer.onLabelChanged(e => {
                // 	strictEqual(e.title, '');
                // 	strictEqual(e.description, '');
                // });
                (0, assert_1.strictEqual)(terminalLabelComputer.title, '');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, '');
            });
            test('should resolve cwd', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' - ', title: '${cwd}', description: '${cwd}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, cwd: ROOT_1 }));
                (0, assert_1.strictEqual)(terminalLabelComputer.title, ROOT_1);
                (0, assert_1.strictEqual)(terminalLabelComputer.description, ROOT_1);
            });
            test('should resolve workspaceFolder', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' - ', title: '${workspaceFolder}', description: '${workspaceFolder}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'zsh', workspaceFolder: { uri: uri_1.URI.from({ scheme: network_1.Schemas.file, path: 'folder' }) } }));
                (0, assert_1.strictEqual)(terminalLabelComputer.title, 'folder');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, 'folder');
            });
            test('should resolve local', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' - ', title: '${local}', description: '${local}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'zsh', shellLaunchConfig: { type: 'Local' } }));
                (0, assert_1.strictEqual)(terminalLabelComputer.title, 'Local');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, 'Local');
            });
            test('should resolve process', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' - ', title: '${process}', description: '${process}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'zsh' }));
                (0, assert_1.strictEqual)(terminalLabelComputer.title, 'zsh');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, 'zsh');
            });
            test('should resolve sequence', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' - ', title: '${sequence}', description: '${sequence}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, sequence: 'sequence' }));
                (0, assert_1.strictEqual)(terminalLabelComputer.title, 'sequence');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, 'sequence');
            });
            test('should resolve task', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' ~ ', title: '${process}${separator}${task}', description: '${task}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'zsh', shellLaunchConfig: { type: 'Task' } }));
                (0, assert_1.strictEqual)(terminalLabelComputer.title, 'zsh ~ Task');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, 'Task');
            });
            test('should resolve separator', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' ~ ', title: '${separator}', description: '${separator}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'zsh', shellLaunchConfig: { type: 'Task' } }));
                (0, assert_1.strictEqual)(terminalLabelComputer.title, 'zsh');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, '');
            });
            test('should always return static title when specified', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' ~ ', title: '${process}', description: '${workspaceFolder}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'process', workspaceFolder: { uri: uri_1.URI.from({ scheme: network_1.Schemas.file, path: 'folder' }) }, staticTitle: 'my-title' }));
                (0, assert_1.strictEqual)(terminalLabelComputer.title, 'my-title');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, 'folder');
            });
            test('should provide cwdFolder for all cwds only when in multi-root', () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' ~ ', title: '${process}${separator}${cwdFolder}', description: '${cwdFolder}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'process', workspaceFolder: { uri: uri_1.URI.from({ scheme: network_1.Schemas.file, path: ROOT_1 }) }, cwd: ROOT_1 }));
                // single-root, cwd is same as root
                (0, assert_1.strictEqual)(terminalLabelComputer.title, 'process');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, '');
                // multi-root
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' ~ ', title: '${process}${separator}${cwdFolder}', description: '${cwdFolder}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockMultiRootContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'process', workspaceFolder: { uri: uri_1.URI.from({ scheme: network_1.Schemas.file, path: ROOT_1 }) }, cwd: ROOT_2 }));
                if (platform_1.$i) {
                    (0, assert_1.strictEqual)(terminalLabelComputer.title, 'process');
                    (0, assert_1.strictEqual)(terminalLabelComputer.description, '');
                }
                else {
                    (0, assert_1.strictEqual)(terminalLabelComputer.title, 'process ~ root2');
                    (0, assert_1.strictEqual)(terminalLabelComputer.description, 'root2');
                }
            });
            test('should hide cwdFolder in single folder workspaces when cwd matches the workspace\'s default cwd even when slashes differ', async () => {
                configurationService = new testConfigurationService_1.$G0b({ terminal: { integrated: { tabs: { separator: ' ~ ', title: '${process}${separator}${cwdFolder}', description: '${cwdFolder}' } } } });
                configHelper = store.add(new terminalConfigHelper_1.$dib(configurationService, null, null, null, null));
                terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'process', workspaceFolder: { uri: uri_1.URI.from({ scheme: network_1.Schemas.file, path: ROOT_1 }) }, cwd: ROOT_1 }));
                (0, assert_1.strictEqual)(terminalLabelComputer.title, 'process');
                (0, assert_1.strictEqual)(terminalLabelComputer.description, '');
                if (!platform_1.$i) {
                    terminalLabelComputer = store.add(new terminalInstance_1.$_Vb(configHelper, new workbenchTestServices_2.$Fec(), mockContextService));
                    terminalLabelComputer.refreshLabel(createInstance({ capabilities, processName: 'process', workspaceFolder: { uri: uri_1.URI.from({ scheme: network_1.Schemas.file, path: ROOT_1 }) }, cwd: ROOT_2 }));
                    (0, assert_1.strictEqual)(terminalLabelComputer.title, 'process ~ root2');
                    (0, assert_1.strictEqual)(terminalLabelComputer.description, 'root2');
                }
            });
        });
    });
});
//# sourceMappingURL=terminalInstance.test.js.map