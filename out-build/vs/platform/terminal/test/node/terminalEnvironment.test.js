/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "vs/base/common/platform", "vs/base/test/common/utils", "vs/platform/log/common/log", "vs/platform/terminal/node/terminalEnvironment"], function (require, exports, assert_1, os_1, platform_1, utils_1, log_1, terminalEnvironment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const enabledProcessOptions = { shellIntegration: { enabled: true, suggestEnabled: false, nonce: '' }, windowsEnableConpty: true, environmentVariableCollections: undefined, workspaceFolder: undefined };
    const disabledProcessOptions = { shellIntegration: { enabled: false, suggestEnabled: false, nonce: '' }, windowsEnableConpty: true, environmentVariableCollections: undefined, workspaceFolder: undefined };
    const winptyProcessOptions = { shellIntegration: { enabled: true, suggestEnabled: false, nonce: '' }, windowsEnableConpty: false, environmentVariableCollections: undefined, workspaceFolder: undefined };
    const pwshExe = process.platform === 'win32' ? 'pwsh.exe' : 'pwsh';
    const repoRoot = process.platform === 'win32' ? process.cwd()[0].toLowerCase() + process.cwd().substring(1) : process.cwd();
    const logService = new log_1.$fj();
    const productService = { applicationName: 'vscode' };
    const defaultEnvironment = {};
    suite('platform - terminalEnvironment', () => {
        (0, utils_1.$bT)();
        suite('getShellIntegrationInjection', () => {
            suite('should not enable', () => {
                // This test is only expected to work on Windows 10 build 18309 and above
                ((0, terminalEnvironment_1.$hr)() < 18309 ? test.skip : test)('when isFeatureTerminal or when no executable is provided', () => {
                    (0, assert_1.ok)(!(0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-l', '-NoLogo'], isFeatureTerminal: true }, enabledProcessOptions, defaultEnvironment, logService, productService));
                    (0, assert_1.ok)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-l', '-NoLogo'], isFeatureTerminal: false }, enabledProcessOptions, defaultEnvironment, logService, productService));
                });
                if (platform_1.$i) {
                    test('when on windows with conpty false', () => {
                        (0, assert_1.ok)(!(0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-l'], isFeatureTerminal: false }, winptyProcessOptions, defaultEnvironment, logService, productService));
                    });
                }
            });
            // These tests are only expected to work on Windows 10 build 18309 and above
            ((0, terminalEnvironment_1.$hr)() < 18309 ? suite.skip : suite)('pwsh', () => {
                const expectedPs1 = process.platform === 'win32'
                    ? `try { . "${repoRoot}\\out\\vs\\workbench\\contrib\\terminal\\browser\\media\\shellIntegration.ps1" } catch {}`
                    : `. "${repoRoot}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration.ps1"`;
                suite('should override args', () => {
                    const enabledExpectedResult = Object.freeze({
                        newArgs: [
                            '-noexit',
                            '-command',
                            expectedPs1
                        ],
                        envMixin: {
                            VSCODE_INJECTION: '1'
                        }
                    });
                    test('when undefined, []', () => {
                        (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: [] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                        (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: undefined }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                    });
                    suite('when no logo', () => {
                        test('array - case insensitive', () => {
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-NoLogo'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-NOLOGO'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-nol'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-NOL'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                        });
                        test('string - case insensitive', () => {
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: '-NoLogo' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: '-NOLOGO' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: '-nol' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: '-NOL' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                        });
                    });
                });
                suite('should incorporate login arg', () => {
                    const enabledExpectedResult = Object.freeze({
                        newArgs: [
                            '-l',
                            '-noexit',
                            '-command',
                            expectedPs1
                        ],
                        envMixin: {
                            VSCODE_INJECTION: '1'
                        }
                    });
                    test('when array contains no logo and login', () => {
                        (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-l', '-NoLogo'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                    });
                    test('when string', () => {
                        (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: '-l' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                    });
                });
                suite('should not modify args', () => {
                    test('when shell integration is disabled', () => {
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-l'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: '-l' }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: undefined }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                    });
                    test('when using unrecognized arg', () => {
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: ['-l', '-NoLogo', '-i'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                    });
                    test('when using unrecognized arg (string)', () => {
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: pwshExe, args: '-i' }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                    });
                });
            });
            if (process.platform !== 'win32') {
                suite('zsh', () => {
                    suite('should override args', () => {
                        const username = (0, os_1.userInfo)().username;
                        const expectedDir = new RegExp(`.+\/${username}-vscode-zsh`);
                        const customZdotdir = '/custom/zsh/dotdir';
                        const expectedDests = [
                            new RegExp(`.+\\/${username}-vscode-zsh\\/\\.zshrc`),
                            new RegExp(`.+\\/${username}-vscode-zsh\\/\\.zprofile`),
                            new RegExp(`.+\\/${username}-vscode-zsh\\/\\.zshenv`),
                            new RegExp(`.+\\/${username}-vscode-zsh\\/\\.zlogin`)
                        ];
                        const expectedSources = [
                            /.+\/out\/vs\/workbench\/contrib\/terminal\/browser\/media\/shellIntegration-rc.zsh/,
                            /.+\/out\/vs\/workbench\/contrib\/terminal\/browser\/media\/shellIntegration-profile.zsh/,
                            /.+\/out\/vs\/workbench\/contrib\/terminal\/browser\/media\/shellIntegration-env.zsh/,
                            /.+\/out\/vs\/workbench\/contrib\/terminal\/browser\/media\/shellIntegration-login.zsh/
                        ];
                        function assertIsEnabled(result, globalZdotdir = (0, os_1.homedir)()) {
                            (0, assert_1.strictEqual)(Object.keys(result.envMixin).length, 3);
                            (0, assert_1.ok)(result.envMixin['ZDOTDIR']?.match(expectedDir));
                            (0, assert_1.strictEqual)(result.envMixin['USER_ZDOTDIR'], globalZdotdir);
                            (0, assert_1.ok)(result.envMixin['VSCODE_INJECTION']?.match('1'));
                            (0, assert_1.strictEqual)(result.filesToCopy?.length, 4);
                            (0, assert_1.ok)(result.filesToCopy[0].dest.match(expectedDests[0]));
                            (0, assert_1.ok)(result.filesToCopy[1].dest.match(expectedDests[1]));
                            (0, assert_1.ok)(result.filesToCopy[2].dest.match(expectedDests[2]));
                            (0, assert_1.ok)(result.filesToCopy[3].dest.match(expectedDests[3]));
                            (0, assert_1.ok)(result.filesToCopy[0].source.match(expectedSources[0]));
                            (0, assert_1.ok)(result.filesToCopy[1].source.match(expectedSources[1]));
                            (0, assert_1.ok)(result.filesToCopy[2].source.match(expectedSources[2]));
                            (0, assert_1.ok)(result.filesToCopy[3].source.match(expectedSources[3]));
                        }
                        test('when undefined, []', () => {
                            const result1 = (0, terminalEnvironment_1.$jr)({ executable: 'zsh', args: [] }, enabledProcessOptions, defaultEnvironment, logService, productService);
                            (0, assert_1.deepStrictEqual)(result1?.newArgs, ['-i']);
                            assertIsEnabled(result1);
                            const result2 = (0, terminalEnvironment_1.$jr)({ executable: 'zsh', args: undefined }, enabledProcessOptions, defaultEnvironment, logService, productService);
                            (0, assert_1.deepStrictEqual)(result2?.newArgs, ['-i']);
                            assertIsEnabled(result2);
                        });
                        suite('should incorporate login arg', () => {
                            test('when array', () => {
                                const result = (0, terminalEnvironment_1.$jr)({ executable: 'zsh', args: ['-l'] }, enabledProcessOptions, defaultEnvironment, logService, productService);
                                (0, assert_1.deepStrictEqual)(result?.newArgs, ['-il']);
                                assertIsEnabled(result);
                            });
                        });
                        suite('should not modify args', () => {
                            test('when shell integration is disabled', () => {
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'zsh', args: ['-l'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'zsh', args: undefined }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                            });
                            test('when using unrecognized arg', () => {
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'zsh', args: ['-l', '-fake'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                            });
                        });
                        suite('should incorporate global ZDOTDIR env variable', () => {
                            test('when custom ZDOTDIR', () => {
                                const result1 = (0, terminalEnvironment_1.$jr)({ executable: 'zsh', args: [] }, enabledProcessOptions, { ...defaultEnvironment, ZDOTDIR: customZdotdir }, logService, productService);
                                (0, assert_1.deepStrictEqual)(result1?.newArgs, ['-i']);
                                assertIsEnabled(result1, customZdotdir);
                            });
                            test('when undefined', () => {
                                const result1 = (0, terminalEnvironment_1.$jr)({ executable: 'zsh', args: [] }, enabledProcessOptions, undefined, logService, productService);
                                (0, assert_1.deepStrictEqual)(result1?.newArgs, ['-i']);
                                assertIsEnabled(result1);
                            });
                        });
                    });
                });
                suite('bash', () => {
                    suite('should override args', () => {
                        test('when undefined, [], empty string', () => {
                            const enabledExpectedResult = Object.freeze({
                                newArgs: [
                                    '--init-file',
                                    `${repoRoot}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration-bash.sh`
                                ],
                                envMixin: {
                                    VSCODE_INJECTION: '1'
                                }
                            });
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'bash', args: [] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'bash', args: '' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'bash', args: undefined }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                        });
                        suite('should set login env variable and not modify args', () => {
                            const enabledExpectedResult = Object.freeze({
                                newArgs: [
                                    '--init-file',
                                    `${repoRoot}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration-bash.sh`
                                ],
                                envMixin: {
                                    VSCODE_INJECTION: '1',
                                    VSCODE_SHELL_LOGIN: '1'
                                }
                            });
                            test('when array', () => {
                                (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'bash', args: ['-l'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            });
                        });
                        suite('should not modify args', () => {
                            test('when shell integration is disabled', () => {
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'bash', args: ['-l'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'bash', args: undefined }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                            });
                            test('when custom array entry', () => {
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$jr)({ executable: 'bash', args: ['-l', '-i'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                            });
                        });
                    });
                });
            }
        });
    });
});
//# sourceMappingURL=terminalEnvironment.test.js.map