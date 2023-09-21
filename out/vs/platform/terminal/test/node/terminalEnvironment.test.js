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
    const logService = new log_1.NullLogService();
    const productService = { applicationName: 'vscode' };
    const defaultEnvironment = {};
    suite('platform - terminalEnvironment', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('getShellIntegrationInjection', () => {
            suite('should not enable', () => {
                // This test is only expected to work on Windows 10 build 18309 and above
                ((0, terminalEnvironment_1.getWindowsBuildNumber)() < 18309 ? test.skip : test)('when isFeatureTerminal or when no executable is provided', () => {
                    (0, assert_1.ok)(!(0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-l', '-NoLogo'], isFeatureTerminal: true }, enabledProcessOptions, defaultEnvironment, logService, productService));
                    (0, assert_1.ok)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-l', '-NoLogo'], isFeatureTerminal: false }, enabledProcessOptions, defaultEnvironment, logService, productService));
                });
                if (platform_1.isWindows) {
                    test('when on windows with conpty false', () => {
                        (0, assert_1.ok)(!(0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-l'], isFeatureTerminal: false }, winptyProcessOptions, defaultEnvironment, logService, productService));
                    });
                }
            });
            // These tests are only expected to work on Windows 10 build 18309 and above
            ((0, terminalEnvironment_1.getWindowsBuildNumber)() < 18309 ? suite.skip : suite)('pwsh', () => {
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
                        (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: [] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                        (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: undefined }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                    });
                    suite('when no logo', () => {
                        test('array - case insensitive', () => {
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-NoLogo'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-NOLOGO'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-nol'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-NOL'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                        });
                        test('string - case insensitive', () => {
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: '-NoLogo' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: '-NOLOGO' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: '-nol' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: '-NOL' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
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
                        (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-l', '-NoLogo'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                    });
                    test('when string', () => {
                        (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: '-l' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                    });
                });
                suite('should not modify args', () => {
                    test('when shell integration is disabled', () => {
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-l'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: '-l' }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: undefined }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                    });
                    test('when using unrecognized arg', () => {
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: ['-l', '-NoLogo', '-i'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                    });
                    test('when using unrecognized arg (string)', () => {
                        (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: pwshExe, args: '-i' }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
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
                            const result1 = (0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'zsh', args: [] }, enabledProcessOptions, defaultEnvironment, logService, productService);
                            (0, assert_1.deepStrictEqual)(result1?.newArgs, ['-i']);
                            assertIsEnabled(result1);
                            const result2 = (0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'zsh', args: undefined }, enabledProcessOptions, defaultEnvironment, logService, productService);
                            (0, assert_1.deepStrictEqual)(result2?.newArgs, ['-i']);
                            assertIsEnabled(result2);
                        });
                        suite('should incorporate login arg', () => {
                            test('when array', () => {
                                const result = (0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'zsh', args: ['-l'] }, enabledProcessOptions, defaultEnvironment, logService, productService);
                                (0, assert_1.deepStrictEqual)(result?.newArgs, ['-il']);
                                assertIsEnabled(result);
                            });
                        });
                        suite('should not modify args', () => {
                            test('when shell integration is disabled', () => {
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'zsh', args: ['-l'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'zsh', args: undefined }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                            });
                            test('when using unrecognized arg', () => {
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'zsh', args: ['-l', '-fake'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                            });
                        });
                        suite('should incorporate global ZDOTDIR env variable', () => {
                            test('when custom ZDOTDIR', () => {
                                const result1 = (0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'zsh', args: [] }, enabledProcessOptions, { ...defaultEnvironment, ZDOTDIR: customZdotdir }, logService, productService);
                                (0, assert_1.deepStrictEqual)(result1?.newArgs, ['-i']);
                                assertIsEnabled(result1, customZdotdir);
                            });
                            test('when undefined', () => {
                                const result1 = (0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'zsh', args: [] }, enabledProcessOptions, undefined, logService, productService);
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
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'bash', args: [] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'bash', args: '' }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'bash', args: undefined }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
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
                                (0, assert_1.deepStrictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'bash', args: ['-l'] }, enabledProcessOptions, defaultEnvironment, logService, productService), enabledExpectedResult);
                            });
                        });
                        suite('should not modify args', () => {
                            test('when shell integration is disabled', () => {
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'bash', args: ['-l'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'bash', args: undefined }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                            });
                            test('when custom array entry', () => {
                                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getShellIntegrationInjection)({ executable: 'bash', args: ['-l', '-i'] }, disabledProcessOptions, defaultEnvironment, logService, productService), undefined);
                            });
                        });
                    });
                });
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbnZpcm9ubWVudC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvdGVzdC9ub2RlL3Rlcm1pbmFsRW52aXJvbm1lbnQudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVdoRyxNQUFNLHFCQUFxQixHQUE0QixFQUFFLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsOEJBQThCLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUNuTyxNQUFNLHNCQUFzQixHQUE0QixFQUFFLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsOEJBQThCLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUNyTyxNQUFNLG9CQUFvQixHQUE0QixFQUFFLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsOEJBQThCLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUNuTyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbkUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFD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QUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQzNDLElBQUEsV0FBRSxFQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN2RCxJQUFBLFdBQUUsRUFBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDdkQsSUFBQSxXQUFFLEVBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZELElBQUEsV0FBRSxFQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN2RCxJQUFBLFdBQUUsRUFBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDM0QsSUFBQSxXQUFFLEVBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzNELElBQUEsV0FBRSxFQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMzRCxJQUFBLFdBQUUsRUFBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMs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