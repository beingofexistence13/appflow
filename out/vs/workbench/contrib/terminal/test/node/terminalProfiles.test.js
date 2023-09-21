/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/platform/terminal/node/terminalProfiles", "vs/platform/configuration/test/common/testConfigurationService", "vs/base/test/common/utils"], function (require, exports, assert_1, platform_1, terminalProfiles_1, testConfigurationService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Assets that two profiles objects are equal, this will treat explicit undefined and unset
     * properties the same. Order of the profiles is ignored.
     */
    function profilesEqual(actualProfiles, expectedProfiles) {
        (0, assert_1.strictEqual)(actualProfiles.length, expectedProfiles.length, `Actual: ${actualProfiles.map(e => e.profileName).join(',')}\nExpected: ${expectedProfiles.map(e => e.profileName).join(',')}`);
        for (const expected of expectedProfiles) {
            const actual = actualProfiles.find(e => e.profileName === expected.profileName);
            (0, assert_1.ok)(actual, `Expected profile ${expected.profileName} not found`);
            (0, assert_1.strictEqual)(actual.profileName, expected.profileName);
            (0, assert_1.strictEqual)(actual.path, expected.path);
            (0, assert_1.deepStrictEqual)(actual.args, expected.args);
            (0, assert_1.strictEqual)(actual.isAutoDetected, expected.isAutoDetected);
            (0, assert_1.strictEqual)(actual.overrideName, expected.overrideName);
        }
    }
    suite('Workbench - TerminalProfiles', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('detectAvailableProfiles', () => {
            if (platform_1.isWindows) {
                test('should detect Git Bash and provide login args', async () => {
                    const fsProvider = createFsProvider([
                        'C:\\Program Files\\Git\\bin\\bash.exe'
                    ]);
                    const config = {
                        profiles: {
                            windows: {
                                'Git Bash': { source: "Git Bash" /* ProfileSource.GitBash */ }
                            },
                            linux: {},
                            osx: {}
                        },
                        useWslProfiles: false
                    };
                    const configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: config } });
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(undefined, undefined, false, configurationService, process.env, fsProvider, undefined, undefined, undefined);
                    const expected = [
                        { profileName: 'Git Bash', path: 'C:\\Program Files\\Git\\bin\\bash.exe', args: ['--login', '-i'], isDefault: true }
                    ];
                    profilesEqual(profiles, expected);
                });
                test('should allow source to have args', async () => {
                    const pwshSourcePaths = [
                        'C:\\Program Files\\PowerShell\\7\\pwsh.exe'
                    ];
                    const fsProvider = createFsProvider(pwshSourcePaths);
                    const config = {
                        profiles: {
                            windows: {
                                'PowerShell': { source: "PowerShell" /* ProfileSource.Pwsh */, args: ['-NoProfile'], overrideName: true }
                            },
                            linux: {},
                            osx: {},
                        },
                        useWslProfiles: false
                    };
                    const configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: config } });
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(undefined, undefined, false, configurationService, process.env, fsProvider, undefined, undefined, pwshSourcePaths);
                    const expected = [
                        { profileName: 'PowerShell', path: 'C:\\Program Files\\PowerShell\\7\\pwsh.exe', overrideName: true, args: ['-NoProfile'], isDefault: true }
                    ];
                    profilesEqual(profiles, expected);
                });
                test('configured args should override default source ones', async () => {
                    const fsProvider = createFsProvider([
                        'C:\\Program Files\\Git\\bin\\bash.exe'
                    ]);
                    const config = {
                        profiles: {
                            windows: {
                                'Git Bash': { source: "Git Bash" /* ProfileSource.GitBash */, args: [] }
                            },
                            linux: {},
                            osx: {}
                        },
                        useWslProfiles: false
                    };
                    const configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: config } });
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(undefined, undefined, false, configurationService, process.env, fsProvider, undefined, undefined, undefined);
                    const expected = [{ profileName: 'Git Bash', path: 'C:\\Program Files\\Git\\bin\\bash.exe', args: [], isAutoDetected: undefined, overrideName: undefined, isDefault: true }];
                    profilesEqual(profiles, expected);
                });
                suite('pwsh source detection/fallback', () => {
                    const pwshSourceConfig = {
                        profiles: {
                            windows: {
                                'PowerShell': { source: "PowerShell" /* ProfileSource.Pwsh */ }
                            },
                            linux: {},
                            osx: {},
                        },
                        useWslProfiles: false
                    };
                    test('should prefer pwsh 7 to Windows PowerShell', async () => {
                        const pwshSourcePaths = [
                            'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
                            'C:\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe',
                            'C:\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
                        ];
                        const fsProvider = createFsProvider(pwshSourcePaths);
                        const configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: pwshSourceConfig } });
                        const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(undefined, undefined, false, configurationService, process.env, fsProvider, undefined, undefined, pwshSourcePaths);
                        const expected = [
                            { profileName: 'PowerShell', path: 'C:\\Program Files\\PowerShell\\7\\pwsh.exe', isDefault: true }
                        ];
                        profilesEqual(profiles, expected);
                    });
                    test('should prefer pwsh 7 to pwsh 6', async () => {
                        const pwshSourcePaths = [
                            'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
                            'C:\\Program Files\\PowerShell\\6\\pwsh.exe',
                            'C:\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe',
                            'C:\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
                        ];
                        const fsProvider = createFsProvider(pwshSourcePaths);
                        const configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: pwshSourceConfig } });
                        const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(undefined, undefined, false, configurationService, process.env, fsProvider, undefined, undefined, pwshSourcePaths);
                        const expected = [
                            { profileName: 'PowerShell', path: 'C:\\Program Files\\PowerShell\\7\\pwsh.exe', isDefault: true }
                        ];
                        profilesEqual(profiles, expected);
                    });
                    test('should fallback to Windows PowerShell', async () => {
                        const pwshSourcePaths = [
                            'C:\\Windows\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe',
                            'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
                        ];
                        const fsProvider = createFsProvider(pwshSourcePaths);
                        const configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: pwshSourceConfig } });
                        const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(undefined, undefined, false, configurationService, process.env, fsProvider, undefined, undefined, pwshSourcePaths);
                        (0, assert_1.strictEqual)(profiles.length, 1);
                        (0, assert_1.strictEqual)(profiles[0].profileName, 'PowerShell');
                    });
                });
            }
            else {
                const absoluteConfig = {
                    profiles: {
                        windows: {},
                        osx: {
                            'fakeshell1': { path: '/bin/fakeshell1' },
                            'fakeshell2': { path: '/bin/fakeshell2' },
                            'fakeshell3': { path: '/bin/fakeshell3' }
                        },
                        linux: {
                            'fakeshell1': { path: '/bin/fakeshell1' },
                            'fakeshell2': { path: '/bin/fakeshell2' },
                            'fakeshell3': { path: '/bin/fakeshell3' }
                        }
                    },
                    useWslProfiles: false
                };
                const onPathConfig = {
                    profiles: {
                        windows: {},
                        osx: {
                            'fakeshell1': { path: 'fakeshell1' },
                            'fakeshell2': { path: 'fakeshell2' },
                            'fakeshell3': { path: 'fakeshell3' }
                        },
                        linux: {
                            'fakeshell1': { path: 'fakeshell1' },
                            'fakeshell2': { path: 'fakeshell2' },
                            'fakeshell3': { path: 'fakeshell3' }
                        }
                    },
                    useWslProfiles: false
                };
                test('should detect shells via absolute paths', async () => {
                    const fsProvider = createFsProvider([
                        '/bin/fakeshell1',
                        '/bin/fakeshell3'
                    ]);
                    const configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: absoluteConfig } });
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(undefined, undefined, false, configurationService, process.env, fsProvider, undefined, undefined, undefined);
                    const expected = [
                        { profileName: 'fakeshell1', path: '/bin/fakeshell1', isDefault: true },
                        { profileName: 'fakeshell3', path: '/bin/fakeshell3', isDefault: true }
                    ];
                    profilesEqual(profiles, expected);
                });
                test('should auto detect shells via /etc/shells', async () => {
                    const fsProvider = createFsProvider([
                        '/bin/fakeshell1',
                        '/bin/fakeshell3'
                    ], '/bin/fakeshell1\n/bin/fakeshell3');
                    const configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: onPathConfig } });
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(undefined, undefined, true, configurationService, process.env, fsProvider, undefined, undefined, undefined);
                    const expected = [
                        { profileName: 'fakeshell1', path: '/bin/fakeshell1', isFromPath: true, isDefault: true },
                        { profileName: 'fakeshell3', path: '/bin/fakeshell3', isFromPath: true, isDefault: true }
                    ];
                    profilesEqual(profiles, expected);
                });
                test('should validate auto detected shells from /etc/shells exist', async () => {
                    // fakeshell3 exists in /etc/shells but not on FS
                    const fsProvider = createFsProvider([
                        '/bin/fakeshell1'
                    ], '/bin/fakeshell1\n/bin/fakeshell3');
                    const configurationService = new testConfigurationService_1.TestConfigurationService({ terminal: { integrated: onPathConfig } });
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(undefined, undefined, true, configurationService, process.env, fsProvider, undefined, undefined, undefined);
                    const expected = [
                        { profileName: 'fakeshell1', path: '/bin/fakeshell1', isFromPath: true, isDefault: true }
                    ];
                    profilesEqual(profiles, expected);
                });
            }
        });
        function createFsProvider(expectedPaths, etcShellsContent = '') {
            const provider = {
                async existsFile(path) {
                    return expectedPaths.includes(path);
                },
                async readFile(path) {
                    if (path !== '/etc/shells') {
                        (0, assert_1.fail)('Unexepected path');
                    }
                    return Buffer.from(etcShellsContent);
                }
            };
            return provider;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvdGVzdC9ub2RlL3Rlcm1pbmFsUHJvZmlsZXMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRzs7O09BR0c7SUFDSCxTQUFTLGFBQWEsQ0FBQyxjQUFrQyxFQUFFLGdCQUFvQztRQUM5RixJQUFBLG9CQUFXLEVBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1TCxLQUFLLE1BQU0sUUFBUSxJQUFJLGdCQUFnQixFQUFFO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxLQUFLLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNoRixJQUFBLFdBQUUsRUFBQyxNQUFNLEVBQUUsb0JBQW9CLFFBQVEsQ0FBQyxXQUFXLFlBQVksQ0FBQyxDQUFDO1lBQ2pFLElBQUEsb0JBQVcsRUFBQyxNQUFNLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0RCxJQUFBLG9CQUFXLEVBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEMsSUFBQSx3QkFBZSxFQUFDLE1BQU0sQ0FB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