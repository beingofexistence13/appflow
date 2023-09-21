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
        const store = (0, utils_1.$bT)();
        suite('TerminalPersistedHistory', () => {
            let history;
            let instantiationService;
            let storageService;
            let configurationService;
            setup(() => {
                configurationService = new testConfigurationService_1.$G0b(getConfig(5));
                storageService = store.add(new workbenchTestServices_1.$7dc());
                instantiationService = store.add(new instantiationServiceMock_1.$L0b());
                instantiationService.set(configuration_1.$8h, configurationService);
                instantiationService.set(storage_1.$Vo, storageService);
                history = store.add(instantiationService.createInstance((history_1.$wVb), 'test'));
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
                const history2 = store.add(instantiationService.createInstance(history_1.$wVb, 'test'));
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
                instantiationService = new instantiationServiceMock_1.$L0b();
                instantiationService.stub(files_1.$6j, {
                    async readFile(resource) {
                        const expected = uri_1.URI.from({ scheme: fileScheme, path: filePath });
                        (0, assert_1.strictEqual)(resource.scheme, expected.scheme);
                        (0, assert_1.strictEqual)(resource.path, expected.path);
                        return { value: buffer_1.$Fd.fromString(fileContent) };
                    }
                });
                instantiationService.stub(remoteAgentService_1.$jm, {
                    async getEnvironment() { return remoteEnvironment; },
                    getConnection() { return remoteConnection; }
                });
            });
            teardown(() => {
                instantiationService.dispose();
            });
            if (!platform_1.$i) {
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
                        (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$xVb))), expectedCommands);
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
                    (0, assert_1.strictEqual)(await instantiationService.invokeFunction(history_1.$xVb), undefined);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$xVb))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$xVb))), expectedCommands);
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
                instantiationService = new instantiationServiceMock_1.$L0b();
                instantiationService.stub(files_1.$6j, {
                    async readFile(resource) {
                        const expected = uri_1.URI.from({ scheme: fileScheme, path: filePath });
                        (0, assert_1.strictEqual)(resource.scheme, expected.scheme);
                        (0, assert_1.strictEqual)(resource.path, expected.path);
                        return { value: buffer_1.$Fd.fromString(fileContent) };
                    }
                });
                instantiationService.stub(remoteAgentService_1.$jm, {
                    async getEnvironment() { return remoteEnvironment; },
                    getConnection() { return remoteConnection; }
                });
            });
            teardown(() => {
                instantiationService.dispose();
            });
            if (!platform_1.$i) {
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
                        (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$yVb))), expectedCommands);
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
                    (0, assert_1.strictEqual)(await instantiationService.invokeFunction(history_1.$yVb), undefined);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$yVb))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$yVb))), expectedCommands);
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
                instantiationService = new instantiationServiceMock_1.$L0b();
                instantiationService.stub(files_1.$6j, {
                    async readFile(resource) {
                        const expected = uri_1.URI.from({ scheme: fileScheme, path: filePath });
                        if (resource.scheme !== expected.scheme || resource.fsPath !== expected.fsPath) {
                            (0, assert_1.fail)(`Unexpected file scheme/path ${resource.scheme} ${resource.fsPath}`);
                        }
                        return { value: buffer_1.$Fd.fromString(fileContent) };
                    }
                });
                instantiationService.stub(remoteAgentService_1.$jm, {
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
                    if (platform_1.$i) {
                        filePath = (0, path_1.$9d)(process_1.env['APPDATA'], 'Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt');
                    }
                    else {
                        filePath = (0, path_1.$9d)(process_1.env['HOME'], '.local/share/powershell/PSReadline/ConsoleHost_history.txt');
                    }
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$zVb))), expectedCommands);
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
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$zVb))), expectedCommands);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    process_1.env['HOME'] = '/home/user';
                    filePath = '/home/user/.local/share/powershell/PSReadline/ConsoleHost_history.txt';
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$zVb))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    process_1.env['HOME'] = '/home/user';
                    filePath = '/home/user/.local/share/powershell/PSReadline/ConsoleHost_history.txt';
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$zVb))), expectedCommands);
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
                instantiationService = new instantiationServiceMock_1.$L0b();
                instantiationService.stub(files_1.$6j, {
                    async readFile(resource) {
                        const expected = uri_1.URI.from({ scheme: fileScheme, path: filePath });
                        (0, assert_1.strictEqual)(resource.scheme, expected.scheme);
                        (0, assert_1.strictEqual)(resource.path, expected.path);
                        return { value: buffer_1.$Fd.fromString(fileContent) };
                    }
                });
                instantiationService.stub(remoteAgentService_1.$jm, {
                    async getEnvironment() { return remoteEnvironment; },
                    getConnection() { return remoteConnection; }
                });
            });
            teardown(() => {
                instantiationService.dispose();
            });
            if (!platform_1.$i) {
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
                        (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$AVb))), expectedCommands);
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
                        (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$AVb))), expectedCommands);
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
                    (0, assert_1.strictEqual)(await instantiationService.invokeFunction(history_1.$AVb), undefined);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$AVb))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$AVb))), expectedCommands);
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
                    (0, assert_1.strictEqual)(await instantiationService.invokeFunction(history_1.$AVb), undefined);
                });
                test('macOS', async () => {
                    remoteEnvironment = { os: 2 /* OperatingSystem.Macintosh */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$AVb))), expectedCommands);
                });
                test('Linux', async () => {
                    remoteEnvironment = { os: 3 /* OperatingSystem.Linux */ };
                    (0, assert_1.deepStrictEqual)(Array.from((await instantiationService.invokeFunction(history_1.$AVb))), expectedCommands);
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
                        (0, assert_1.ok)((0, history_1.$BVb)(x).includes('\n'));
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
                        (0, assert_1.ok)(!(0, history_1.$BVb)(x).includes('\n'));
                    }
                });
            });
        });
    });
});
//# sourceMappingURL=history.test.js.map