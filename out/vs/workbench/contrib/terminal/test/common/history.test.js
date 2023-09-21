/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/buffer", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/files/common/files", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/storage/common/storage", "vs/workbench/contrib/terminal/common/history", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert_1, buffer_1, network_1, path_1, platform_1, process_1, uri_1, utils_1, configuration_1, testConfigurationService_1, files_1, instantiationServiceMock_1, storage_1, history_1, remoteAgentService_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getConfig(limit) {
        return {
            terminal: {
                integrated: {
                    shellIntegration: {
                        history: limit
                    }
                }
            }
        };
    }
    const expectedCommands = [
        'single line command',
        'git commit -m "A wrapped line in pwsh history\n\nSome commit description\n\nFixes #xyz"',
        'git status',
        'two "\nline"'
    ];
    suite('Terminal history', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('TerminalPersistedHistory', () => {
            let history;
            let instantiationService;
            let storageService;
            let configurationService;
            setup(() => {
                configurationService = new testConfigurationService_1.TestConfigurationService(getConfig(5));
                storageService = store.add(new workbenchTestServices_1.TestStorageService());
                instantiationService = store.add(new instantiationServiceMock_1.TestInstantiationService());
                instantiationService.set(configuration_1.IConfigurationService, configurationService);
                instantiationService.set(storage_1.IStorageService, storageService);
                history = store.add(instantiationService.createInstance((history_1.TerminalPersistedHistory), 'test'));
            });
            teardown(() => {
                instantiationService.dispose();
            });
            test('should support adding items to the cache and respect LRU', () => {
                history.add('foo', 1);
                (0, assert_1.deepStrictEqual)(Array.from(history.entries), [
                    ['foo', 1]
                ]);
                history.add('bar', 2);
                (0, assert_1.deepStrictEqual)(Array.from(history.entries), [
                    ['foo', 1],
                    ['bar', 2]
                ]);
                history.add('foo', 1);
                (0, assert_1.deepStrictEqual)(Array.from(history.entries), [
                    ['bar', 2],
                    ['foo', 1]
                ]);
            });
            test('should support removing specific items', () => {
                history.add('1', 1);
                history.add('2', 2);
                history.add('3', 3);
                history.add('4', 4);
                history.add('5', 5);
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 5);
                history.add('6', 6);
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 5);
            });
            test('should limit the number of entries based on config', () => {
                history.add('1', 1);
                history.add('2', 2);
                history.add('3', 3);
                history.add('4', 4);
                history.add('5', 5);
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 5);
                history.add('6', 6);
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 5);
                configurationService.setUserConfiguration('terminal', getConfig(2).terminal);
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 2);
                history.add('7', 7);
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 2);
                configurationService.setUserConfiguration('terminal', getConfig(3).terminal);
                configurationService.onDidChangeConfigurationEmitter.fire({ affectsConfiguration: () => true });
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 2);
                history.add('8', 8);
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 3);
                history.add('9', 9);
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 3);
            });
            test('should reload from storage service after recreation', () => {
                history.add('1', 1);
                history.add('2', 2);
                history.add('3', 3);
                (0, assert_1.strictEqual)(Array.from(history.entries).length, 3);
                const history2 = store.add(instantiationService.createInstance(history_1.TerminalPersistedHistory, 'test'));
                (0, assert_1.strictEqual)(Array.from(history2.entries).length, 3);
            });
        });
        suite('fetchBashHistory', () => {
            let fileScheme;
            let filePath;
            const fileContent = [
                'single line command',
                'git commit -m "A wrapped line in pwsh history',
                '',
                'Some commit description',
                '',
                'Fixes #xyz"',
                'git status',
                'two "',
                'line"'
            ].join('\n');
            let instantiationService;
            let remoteConnection = null;
            let remoteEnvironment = null;
            setup(() => {
                instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                instantiationService.stub(files_1.IFileService, {
                    async readFile(resource) {
                        const expected = uri_1.URI.from({ scheme: fileScheme, path: filePath });
                        (0, assert_1.strictEqual)(resource.scheme, expected.scheme);
                        (0, assert_1.strictEqual)(resource.path, expected.path);
                        return { value: buffer_1.VSBuffer.fromString(fileContent) };
                    }
                });
                instantiationService.stub(remoteAgentService_1.IRemoteAgentService, {
                    async getEnvironment() { return remoteEnvironment; },
                    getConnection() { return remoteConnection; }
                });
            });
            teardown(() => {
                instantiationService.dispose();
            });
            if (!platform_1.isWindows) {
                suite('local', () => {
                    let originalEnvValues;
                    setup(() => {
                        originalEnvValues = { HOME: process_1.env['HOME'] };
                        process_1.env['HOME'] = '/home/user';
                        remoteConnection = { remoteAuthority: 'some-remote' };
                        fileScheme = network_1.Schemas.vscodeRemote;
                        filePath = '/home/user/.bash_history';
                    });
                    teardown(() => {
                        if (originalEnvValues['HOME'] === undefined) {
                            delete process_1.env['HOME'];
                        }
                        else {
                            process_1.env['HOME'] = originalEnvValues['HOME'];
                        }
                    });
                    test('current OS', async () => {
                        filePath = '/home/user/.bash_history';
                        (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchBashHistory))), expectedCommands);
                    });
                });
            }
            suite('remote', () => {
                let originalEnvValues;
                setup(() => {
                    originalEnvValues = { HOME: process_1.env['HOME'] };
                    process_1.env['HOME'] = '/home/user';
                    remoteConnection = { remoteAuthority: 'some-remote' };
                    fileScheme = network_1.Schemas.vscodeRemote;
                    filePath = '/home/user/.bash_history';
                });
                teardown(() => {
                    if (originalEnvValues['HOME'] === undefined) {
                        delete process_1.env['HOME'];
                    }
                    else {
                        process_1.env['HOME'] = originalEnvValues['HOME'];
                    }
                });
                test('Windows', async () => {
                    remoteEnvironment = { os: 1 /* OperatingSystem.Windows */ };
                    (0, assert_1.strictEqual)(await instantiationService.invokeFunction(history_1.fetchBashHistory), undefined);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchBashHistory))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchBashHistory))), expectedCommands);
                });
            });
        });
        suite('fetchZshHistory', () => {
            let fileScheme;
            let filePath;
            const fileContent = [
                ': 1655252330:0;single line command',
                ': 1655252330:0;git commit -m "A wrapped line in pwsh history\\',
                '\\',
                'Some commit description\\',
                '\\',
                'Fixes #xyz"',
                ': 1655252330:0;git status',
                ': 1655252330:0;two "\\',
                'line"'
            ].join('\n');
            let instantiationService;
            let remoteConnection = null;
            let remoteEnvironment = null;
            setup(() => {
                instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                instantiationService.stub(files_1.IFileService, {
                    async readFile(resource) {
                        const expected = uri_1.URI.from({ scheme: fileScheme, path: filePath });
                        (0, assert_1.strictEqual)(resource.scheme, expected.scheme);
                        (0, assert_1.strictEqual)(resource.path, expected.path);
                        return { value: buffer_1.VSBuffer.fromString(fileContent) };
                    }
                });
                instantiationService.stub(remoteAgentService_1.IRemoteAgentService, {
                    async getEnvironment() { return remoteEnvironment; },
                    getConnection() { return remoteConnection; }
                });
            });
            teardown(() => {
                instantiationService.dispose();
            });
            if (!platform_1.isWindows) {
                suite('local', () => {
                    let originalEnvValues;
                    setup(() => {
                        originalEnvValues = { HOME: process_1.env['HOME'] };
                        process_1.env['HOME'] = '/home/user';
                        remoteConnection = { remoteAuthority: 'some-remote' };
                        fileScheme = network_1.Schemas.vscodeRemote;
                        filePath = '/home/user/.bash_history';
                    });
                    teardown(() => {
                        if (originalEnvValues['HOME'] === undefined) {
                            delete process_1.env['HOME'];
                        }
                        else {
                            process_1.env['HOME'] = originalEnvValues['HOME'];
                        }
                    });
                    test('current OS', async () => {
                        filePath = '/home/user/.zsh_history';
                        (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchZshHistory))), expectedCommands);
                    });
                });
            }
            suite('remote', () => {
                let originalEnvValues;
                setup(() => {
                    originalEnvValues = { HOME: process_1.env['HOME'] };
                    process_1.env['HOME'] = '/home/user';
                    remoteConnection = { remoteAuthority: 'some-remote' };
                    fileScheme = network_1.Schemas.vscodeRemote;
                    filePath = '/home/user/.zsh_history';
                });
                teardown(() => {
                    if (originalEnvValues['HOME'] === undefined) {
                        delete process_1.env['HOME'];
                    }
                    else {
                        process_1.env['HOME'] = originalEnvValues['HOME'];
                    }
                });
                test('Windows', async () => {
                    remoteEnvironment = { os: 1 /* OperatingSystem.Windows */ };
                    (0, assert_1.strictEqual)(await instantiationService.invokeFunction(history_1.fetchZshHistory), undefined);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchZshHistory))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchZshHistory))), expectedCommands);
                });
            });
        });
        suite('fetchPwshHistory', () => {
            let fileScheme;
            let filePath;
            const fileContent = [
                'single line command',
                'git commit -m "A wrapped line in pwsh history`',
                '`',
                'Some commit description`',
                '`',
                'Fixes #xyz"',
                'git status',
                'two "`',
                'line"'
            ].join('\n');
            let instantiationService;
            let remoteConnection = null;
            let remoteEnvironment = null;
            setup(() => {
                instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                instantiationService.stub(files_1.IFileService, {
                    async readFile(resource) {
                        const expected = uri_1.URI.from({ scheme: fileScheme, path: filePath });
                        if (resource.scheme !== expected.scheme || resource.fsPath !== expected.fsPath) {
                            (0, assert_1.fail)(`Unexpected file scheme/path ${resource.scheme} ${resource.fsPath}`);
                        }
                        return { value: buffer_1.VSBuffer.fromString(fileContent) };
                    }
                });
                instantiationService.stub(remoteAgentService_1.IRemoteAgentService, {
                    async getEnvironment() { return remoteEnvironment; },
                    getConnection() { return remoteConnection; }
                });
            });
            teardown(() => {
                instantiationService.dispose();
            });
            suite('local', () => {
                let originalEnvValues;
                setup(() => {
                    originalEnvValues = { HOME: process_1.env['HOME'], APPDATA: process_1.env['APPDATA'] };
                    process_1.env['HOME'] = '/home/user';
                    process_1.env['APPDATA'] = 'C:\\AppData';
                    remoteConnection = { remoteAuthority: 'some-remote' };
                    fileScheme = network_1.Schemas.vscodeRemote;
                    filePath = '/home/user/.zsh_history';
                    originalEnvValues = { HOME: process_1.env['HOME'], APPDATA: process_1.env['APPDATA'] };
                });
                teardown(() => {
                    if (originalEnvValues['HOME'] === undefined) {
                        delete process_1.env['HOME'];
                    }
                    else {
                        process_1.env['HOME'] = originalEnvValues['HOME'];
                    }
                    if (originalEnvValues['APPDATA'] === undefined) {
                        delete process_1.env['APPDATA'];
                    }
                    else {
                        process_1.env['APPDATA'] = originalEnvValues['APPDATA'];
                    }
                });
                test('current OS', async () => {
                    if (platform_1.isWindows) {
                        filePath = (0, path_1.join)(process_1.env['APPDATA'], 'Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt');
                    }
                    else {
                        filePath = (0, path_1.join)(process_1.env['HOME'], '.local/share/powershell/PSReadline/ConsoleHost_history.txt');
                    }
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchPwshHistory))), expectedCommands);
                });
            });
            suite('remote', () => {
                let originalEnvValues;
                setup(() => {
                    remoteConnection = { remoteAuthority: 'some-remote' };
                    fileScheme = network_1.Schemas.vscodeRemote;
                    originalEnvValues = { HOME: process_1.env['HOME'], APPDATA: process_1.env['APPDATA'] };
                });
                teardown(() => {
                    if (originalEnvValues['HOME'] === undefined) {
                        delete process_1.env['HOME'];
                    }
                    else {
                        process_1.env['HOME'] = originalEnvValues['HOME'];
                    }
                    if (originalEnvValues['APPDATA'] === undefined) {
                        delete process_1.env['APPDATA'];
                    }
                    else {
                        process_1.env['APPDATA'] = originalEnvValues['APPDATA'];
                    }
                });
                test('Windows', async () => {
                    remoteEnvironment = { os: 1 /* OperatingSystem.Windows */ };
                    process_1.env['APPDATA'] = 'C:\\AppData';
                    filePath = 'C:\\AppData\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt';
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchPwshHistory))), expectedCommands);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    process_1.env['HOME'] = '/home/user';
                    filePath = '/home/user/.local/share/powershell/PSReadline/ConsoleHost_history.txt';
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchPwshHistory))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    process_1.env['HOME'] = '/home/user';
                    filePath = '/home/user/.local/share/powershell/PSReadline/ConsoleHost_history.txt';
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchPwshHistory))), expectedCommands);
                });
            });
        });
        suite('fetchFishHistory', () => {
            let fileScheme;
            let filePath;
            const fileContent = [
                '- cmd: single line command',
                '  when: 1650000000',
                '- cmd: git commit -m "A wrapped line in pwsh history\\n\\nSome commit description\\n\\nFixes #xyz"',
                '  when: 1650000010',
                '- cmd: git status',
                '  when: 1650000020',
                '- cmd: two "\\nline"',
                '  when: 1650000030',
            ].join('\n');
            let instantiationService;
            let remoteConnection = null;
            let remoteEnvironment = null;
            setup(() => {
                instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                instantiationService.stub(files_1.IFileService, {
                    async readFile(resource) {
                        const expected = uri_1.URI.from({ scheme: fileScheme, path: filePath });
                        (0, assert_1.strictEqual)(resource.scheme, expected.scheme);
                        (0, assert_1.strictEqual)(resource.path, expected.path);
                        return { value: buffer_1.VSBuffer.fromString(fileContent) };
                    }
                });
                instantiationService.stub(remoteAgentService_1.IRemoteAgentService, {
                    async getEnvironment() { return remoteEnvironment; },
                    getConnection() { return remoteConnection; }
                });
            });
            teardown(() => {
                instantiationService.dispose();
            });
            if (!platform_1.isWindows) {
                suite('local', () => {
                    let originalEnvValues;
                    setup(() => {
                        originalEnvValues = { HOME: process_1.env['HOME'] };
                        process_1.env['HOME'] = '/home/user';
                        remoteConnection = { remoteAuthority: 'some-remote' };
                        fileScheme = network_1.Schemas.vscodeRemote;
                        filePath = '/home/user/.local/share/fish/fish_history';
                    });
                    teardown(() => {
                        if (originalEnvValues['HOME'] === undefined) {
                            delete process_1.env['HOME'];
                        }
                        else {
                            process_1.env['HOME'] = originalEnvValues['HOME'];
                        }
                    });
                    test('current OS', async () => {
                        filePath = '/home/user/.local/share/fish/fish_history';
                        (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchFishHistory))), expectedCommands);
                    });
                });
                suite('local (overriden path)', () => {
                    let originalEnvValues;
                    setup(() => {
                        originalEnvValues = { XDG_DATA_HOME: process_1.env['XDG_DATA_HOME'] };
                        process_1.env['XDG_DATA_HOME'] = '/home/user/data-home';
                        remoteConnection = { remoteAuthority: 'some-remote' };
                        fileScheme = network_1.Schemas.vscodeRemote;
                        filePath = '/home/user/data-home/fish/fish_history';
                    });
                    teardown(() => {
                        if (originalEnvValues['XDG_DATA_HOME'] === undefined) {
                            delete process_1.env['XDG_DATA_HOME'];
                        }
                        else {
                            process_1.env['XDG_DATA_HOME'] = originalEnvValues['XDG_DATA_HOME'];
                        }
                    });
                    test('current OS', async () => {
                        filePath = '/home/user/data-home/fish/fish_history';
                        (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchFishHistory))), expectedCommands);
                    });
                });
            }
            suite('remote', () => {
                let originalEnvValues;
                setup(() => {
                    originalEnvValues = { HOME: process_1.env['HOME'] };
                    process_1.env['HOME'] = '/home/user';
                    remoteConnection = { remoteAuthority: 'some-remote' };
                    fileScheme = network_1.Schemas.vscodeRemote;
                    filePath = '/home/user/.local/share/fish/fish_history';
                });
                teardown(() => {
                    if (originalEnvValues['HOME'] === undefined) {
                        delete process_1.env['HOME'];
                    }
                    else {
                        process_1.env['HOME'] = originalEnvValues['HOME'];
                    }
                });
                test('Windows', async () => {
                    remoteEnvironment = { os: 1 /* OperatingSystem.Windows */ };
                    (0, assert_1.strictEqual)(await instantiationService.invokeFunction(history_1.fetchFishHistory), undefined);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchFishHistory))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchFishHistory))), expectedCommands);
                });
            });
            suite('remote (overriden path)', () => {
                let originalEnvValues;
                setup(() => {
                    originalEnvValues = { XDG_DATA_HOME: process_1.env['XDG_DATA_HOME'] };
                    process_1.env['XDG_DATA_HOME'] = '/home/user/data-home';
                    remoteConnection = { remoteAuthority: 'some-remote' };
                    fileScheme = network_1.Schemas.vscodeRemote;
                    filePath = '/home/user/data-home/fish/fish_history';
                });
                teardown(() => {
                    if (originalEnvValues['XDG_DATA_HOME'] === undefined) {
                        delete process_1.env['XDG_DATA_HOME'];
                    }
                    else {
                        process_1.env['XDG_DATA_HOME'] = originalEnvValues['XDG_DATA_HOME'];
                    }
                });
                test('Windows', async () => {
                    remoteEnvironment = { os: 1 /* OperatingSystem.Windows */ };
                    (0, assert_1.strictEqual)(await instantiationService.invokeFunction(history_1.fetchFishHistory), undefined);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchFishHistory))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.fetchFishHistory))), expectedCommands);
                });
            });
            suite('sanitizeFishHistoryCmd', () => {
                test('valid new-lines', () => {
                    /**
                     * Valid new-lines have odd number of leading backslashes: \n, \\\n, \\\\\n
                     */
                    const cases = [
                        '\\n',
                        '\\n at start',
                        'some \\n in the middle',
                        'at the end \\n',
                        '\\\\\\n',
                        '\\\\\\n valid at start',
                        'valid \\\\\\n in the middle',
                        'valid in the end \\\\\\n',
                        '\\\\\\\\\\n',
                        '\\\\\\\\\\n valid at start',
                        'valid \\\\\\\\\\n in the middle',
                        'valid in the end \\\\\\\\\\n',
                        'mixed valid \\r\\n',
                        'mixed valid \\\\\\r\\n',
                        'mixed valid \\r\\\\\\n',
                    ];
                    for (const x of cases) {
                        (0, assert_1.ok)((0, history_1.sanitizeFishHistoryCmd)(x).includes('\n'));
                    }
                });
                test('invalid new-lines', () => {
                    /**
                     * Invalid new-lines have even number of leading backslashes: \\n, \\\\n, \\\\\\n
                     */
                    const cases = [
                        '\\\\n',
                        '\\\\n invalid at start',
                        'invalid \\\\n in the middle',
                        'invalid in the end \\\\n',
                        '\\\\\\\\n',
                        '\\\\\\\\n invalid at start',
                        'invalid \\\\\\\\n in the middle',
                        'invalid in the end \\\\\\\\n',
                        'mixed invalid \\r\\\\n',
                        'mixed invalid \\r\\\\\\\\n',
                        'echo "\\\\n"',
                    ];
                    for (const x of cases) {
                        (0, assert_1.ok)(!(0, history_1.sanitizeFishHistoryCmd)(x).includes('\n'));
                    }
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvdGVzdC9jb21tb24vaGlzdG9yeS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBb0JoRyxTQUFTLFNBQVMsQ0FBQyxLQUFhO1FBQy9CLE9BQU87WUFDTixRQUFRLEVBQUU7Z0JBQ1QsVUFBVSxFQUFFO29CQUNYLGdCQUFnQixFQUFFO3dCQUNqQixPQUFPLEVBQUUsS0FBSztxQkFDZDtpQkFDRDthQUNEO1NBQ0QsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFNLGdCQUFnQixHQUFHO1FBQ3hCLHFCQUFxQjtRQUNyQix5RkFBeUY7UUFDekYsWUFBWTtRQUNaLGNBQWM7S0FDZCxDQUFDO0lBRUYsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUM5QixNQUFNLEtBQUssR0FBRyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFeEQsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtZQUN0QyxJQUFJLE9BQTBDLENBQUM7WUFDL0MsSUFBSSxvQkFBOEMsQ0FBQztZQUNuRCxJQUFJLGNBQWtDLENBQUM7WUFDdkMsSUFBSSxvQkFBOEMsQ0FBQztZQUVuRCxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUNWLG9CQUFvQixHQUFHLElBQUksbURBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksMENBQWtCLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRCxvQkFBb0IsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksbURBQXdCLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMscUNBQXFCLEVBQUUsb0JBQW9CLENB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