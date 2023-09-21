/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/base/test/common/utils"], function (require, exports, assert_1, platform_1, uri_1, terminalEnvironment_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TerminalEnvironment', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('addTerminalEnvironmentKeys', () => {
            test('should set expected variables', () => {
                const env = {};
                (0, terminalEnvironment_1.addTerminalEnvironmentKeys)(env, '1.2.3', 'en', 'on');
                (0, assert_1.strictEqual)(env['TERM_PROGRAM'], 'vscode');
                (0, assert_1.strictEqual)(env['TERM_PROGRAM_VERSION'], '1.2.3');
                (0, assert_1.strictEqual)(env['COLORTERM'], 'truecolor');
                (0, assert_1.strictEqual)(env['LANG'], 'en_US.UTF-8');
            });
            test('should use language variant for LANG that is provided in locale', () => {
                const env = {};
                (0, terminalEnvironment_1.addTerminalEnvironmentKeys)(env, '1.2.3', 'en-au', 'on');
                (0, assert_1.strictEqual)(env['LANG'], 'en_AU.UTF-8', 'LANG is equal to the requested locale with UTF-8');
            });
            test('should fallback to en_US when no locale is provided', () => {
                const env2 = { FOO: 'bar' };
                (0, terminalEnvironment_1.addTerminalEnvironmentKeys)(env2, '1.2.3', undefined, 'on');
                (0, assert_1.strictEqual)(env2['LANG'], 'en_US.UTF-8', 'LANG is equal to en_US.UTF-8 as fallback.'); // More info on issue #14586
            });
            test('should fallback to en_US when an invalid locale is provided', () => {
                const env3 = { LANG: 'replace' };
                (0, terminalEnvironment_1.addTerminalEnvironmentKeys)(env3, '1.2.3', undefined, 'on');
                (0, assert_1.strictEqual)(env3['LANG'], 'en_US.UTF-8', 'LANG is set to the fallback LANG');
            });
            test('should override existing LANG', () => {
                const env4 = { LANG: 'en_AU.UTF-8' };
                (0, terminalEnvironment_1.addTerminalEnvironmentKeys)(env4, '1.2.3', undefined, 'on');
                (0, assert_1.strictEqual)(env4['LANG'], 'en_US.UTF-8', 'LANG is equal to the parent environment\'s LANG');
            });
        });
        suite('shouldSetLangEnvVariable', () => {
            test('auto', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({}, 'auto'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US' }, 'auto'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US.utf' }, 'auto'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US.utf8' }, 'auto'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US.UTF-8' }, 'auto'), false);
            });
            test('off', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({}, 'off'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US' }, 'off'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US.utf' }, 'off'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US.utf8' }, 'off'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US.UTF-8' }, 'off'), false);
            });
            test('on', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({}, 'on'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US' }, 'on'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US.utf' }, 'on'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US.utf8' }, 'on'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.shouldSetLangEnvVariable)({ LANG: 'en-US.UTF-8' }, 'on'), true);
            });
        });
        suite('getLangEnvVariable', () => {
            test('should fallback to en_US when no locale is provided', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)(undefined), 'en_US.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)(''), 'en_US.UTF-8');
            });
            test('should fallback to default language variants when variant isn\'t provided', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('af'), 'af_ZA.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('am'), 'am_ET.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('be'), 'be_BY.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('bg'), 'bg_BG.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('ca'), 'ca_ES.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('cs'), 'cs_CZ.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('da'), 'da_DK.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('de'), 'de_DE.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('el'), 'el_GR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('en'), 'en_US.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('es'), 'es_ES.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('et'), 'et_EE.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('eu'), 'eu_ES.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('fi'), 'fi_FI.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('fr'), 'fr_FR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('he'), 'he_IL.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('hr'), 'hr_HR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('hu'), 'hu_HU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('hy'), 'hy_AM.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('is'), 'is_IS.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('it'), 'it_IT.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('ja'), 'ja_JP.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('kk'), 'kk_KZ.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('ko'), 'ko_KR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('lt'), 'lt_LT.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('nl'), 'nl_NL.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('no'), 'no_NO.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('pl'), 'pl_PL.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('pt'), 'pt_BR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('ro'), 'ro_RO.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('ru'), 'ru_RU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('sk'), 'sk_SK.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('sl'), 'sl_SI.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('sr'), 'sr_YU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('sv'), 'sv_SE.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('tr'), 'tr_TR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('uk'), 'uk_UA.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('zh'), 'zh_CN.UTF-8');
            });
            test('should set language variant based on full locale', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('en-AU'), 'en_AU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('en-au'), 'en_AU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.getLangEnvVariable)('fa-ke'), 'fa_KE.UTF-8');
            });
        });
        suite('mergeEnvironments', () => {
            test('should add keys', () => {
                const parent = {
                    a: 'b'
                };
                const other = {
                    c: 'd'
                };
                (0, terminalEnvironment_1.mergeEnvironments)(parent, other);
                (0, assert_1.deepStrictEqual)(parent, {
                    a: 'b',
                    c: 'd'
                });
            });
            (!platform_1.isWindows ? test.skip : test)('should add keys ignoring case on Windows', () => {
                const parent = {
                    a: 'b'
                };
                const other = {
                    A: 'c'
                };
                (0, terminalEnvironment_1.mergeEnvironments)(parent, other);
                (0, assert_1.deepStrictEqual)(parent, {
                    a: 'c'
                });
            });
            test('null values should delete keys from the parent env', () => {
                const parent = {
                    a: 'b',
                    c: 'd'
                };
                const other = {
                    a: null
                };
                (0, terminalEnvironment_1.mergeEnvironments)(parent, other);
                (0, assert_1.deepStrictEqual)(parent, {
                    c: 'd'
                });
            });
            (!platform_1.isWindows ? test.skip : test)('null values should delete keys from the parent env ignoring case on Windows', () => {
                const parent = {
                    a: 'b',
                    c: 'd'
                };
                const other = {
                    A: null
                };
                (0, terminalEnvironment_1.mergeEnvironments)(parent, other);
                (0, assert_1.deepStrictEqual)(parent, {
                    c: 'd'
                });
            });
        });
        suite('getCwd', () => {
            // This helper checks the paths in a cross-platform friendly manner
            function assertPathsMatch(a, b) {
                (0, assert_1.strictEqual)(uri_1.URI.file(a).fsPath, uri_1.URI.file(b).fsPath);
            }
            test('should default to userHome for an empty workspace', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, undefined), '/userHome/');
            });
            test('should use to the workspace if it exists', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [] }, '/userHome/', undefined, uri_1.URI.file('/foo'), undefined), '/foo');
            });
            test('should use an absolute custom cwd as is', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, '/foo'), '/foo');
            });
            test('should normalize a relative custom cwd against the workspace path', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [] }, '/userHome/', undefined, uri_1.URI.file('/bar'), 'foo'), '/bar/foo');
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [] }, '/userHome/', undefined, uri_1.URI.file('/bar'), './foo'), '/bar/foo');
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [] }, '/userHome/', undefined, uri_1.URI.file('/bar'), '../foo'), '/foo');
            });
            test('should fall back for relative a custom cwd that doesn\'t have a workspace', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, 'foo'), '/userHome/');
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, './foo'), '/userHome/');
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, '../foo'), '/userHome/');
            });
            test('should ignore custom cwd when told to ignore', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.getCwd)({ executable: undefined, args: [], ignoreConfigurationCwd: true }, '/userHome/', undefined, uri_1.URI.file('/bar'), '/foo'), '/bar');
            });
        });
        suite('preparePathForShell', () => {
            const wslPathBackend = {
                getWslPath: async (original, direction) => {
                    if (direction === 'unix-to-win') {
                        const match = original.match(/^\/mnt\/(?<drive>[a-zA-Z])\/(?<path>.+)$/);
                        const groups = match?.groups;
                        if (!groups) {
                            return original;
                        }
                        return `${groups.drive}:\\${groups.path.replace(/\//g, '\\')}`;
                    }
                    const match = original.match(/(?<drive>[a-zA-Z]):\\(?<path>.+)/);
                    const groups = match?.groups;
                    if (!groups) {
                        return original;
                    }
                    return `/mnt/${groups.drive.toLowerCase()}/${groups.path.replace(/\\/g, '/')}`;
                }
            };
            suite('Windows frontend, Windows backend', () => {
                test('Command Prompt', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `c:\\foo\\bar`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar\'baz', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `c:\\foo\\bar'baz`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar$(echo evil)baz', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `"c:\\foo\\bar$(echo evil)baz"`);
                });
                test('PowerShell', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `c:\\foo\\bar`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar\'baz', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `& 'c:\\foo\\bar''baz'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar$(echo evil)baz', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `& 'c:\\foo\\bar$(echo evil)baz'`);
                });
                test('Git Bash', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar', 'bash', 'bash', "gitbash" /* WindowsShellType.GitBash */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `'c:/foo/bar'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar$(echo evil)baz', 'bash', 'bash', "gitbash" /* WindowsShellType.GitBash */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `'c:/foo/bar(echo evil)baz'`);
                });
                test('WSL', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar', 'bash', 'bash', "wsl" /* WindowsShellType.Wsl */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), '/mnt/c/foo/bar');
                });
            });
            suite('Windows frontend, Linux backend', () => {
                test('Bash', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('/foo/bar', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, true), `'/foo/bar'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('/foo/bar\'baz', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, true), `'/foo/barbaz'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('/foo/bar$(echo evil)baz', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, true), `'/foo/bar(echo evil)baz'`);
                });
            });
            suite('Linux frontend, Windows backend', () => {
                test('Command Prompt', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `c:\\foo\\bar`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar\'baz', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `c:\\foo\\bar'baz`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar$(echo evil)baz', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `"c:\\foo\\bar$(echo evil)baz"`);
                });
                test('PowerShell', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `c:\\foo\\bar`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar\'baz', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `& 'c:\\foo\\bar''baz'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar$(echo evil)baz', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `& 'c:\\foo\\bar$(echo evil)baz'`);
                });
                test('Git Bash', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar', 'bash', 'bash', "gitbash" /* WindowsShellType.GitBash */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `'c:/foo/bar'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar$(echo evil)baz', 'bash', 'bash', "gitbash" /* WindowsShellType.GitBash */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `'c:/foo/bar(echo evil)baz'`);
                });
                test('WSL', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('c:\\foo\\bar', 'bash', 'bash', "wsl" /* WindowsShellType.Wsl */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), '/mnt/c/foo/bar');
                });
            });
            suite('Linux frontend, Linux backend', () => {
                test('Bash', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('/foo/bar', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, false), `'/foo/bar'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('/foo/bar\'baz', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, false), `'/foo/barbaz'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.preparePathForShell)('/foo/bar$(echo evil)baz', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, false), `'/foo/bar(echo evil)baz'`);
                });
            });
        });
        suite('createTerminalEnvironment', () => {
            const commonVariables = {
                COLORTERM: 'truecolor',
                TERM_PROGRAM: 'vscode'
            };
            test('should retain variables equal to the empty string', async () => {
                (0, assert_1.deepStrictEqual)(await (0, terminalEnvironment_1.createTerminalEnvironment)({}, undefined, undefined, undefined, 'off', { foo: 'bar', empty: '' }), { foo: 'bar', empty: '', ...commonVariables });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbnZpcm9ubWVudC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvdGVzdC9jb21tb24vdGVybWluYWxFbnZpcm9ubWVudC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBVWhHLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7UUFDN0MsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDeEMsSUFBSSxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtnQkFDMUMsTUFBTSxHQUFHLEdBQTJCLEVBQUUsQ0FBQztnQkFDdkMsSUFBQSxnREFBMEIsRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDM0MsSUFBQSxvQkFBVyxFQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNsRCxJQUFBLG9CQUFXLEVBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMzQyxJQUFBLG9CQUFXLEVBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGlFQUFpRSxFQUFFLEdBQUcsRUFBRTtnQkFDNUUsTUFBTSxHQUFHLEdBQTJCLEVBQUUsQ0FBQztnQkFDdkMsSUFBQSxnREFBMEIsRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDeEQsSUFBQSxvQkFBVyxFQUFD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SUFBQSx3Q0FBa0IsRUFBQyxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx3Q0FBa0IsRUFBQyxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx3Q0FBa0IsRUFBQyxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx3Q0FBa0IsRUFBQyxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx3Q0FBa0IsRUFBQyxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx3Q0FBa0IsRUFBQyxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx3Q0FBa0IsRUFBQyxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx3Q0FBa0IsRUFBQyxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx3Q0FBa0IsRUFBQyxJQUFJLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDckQsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsSUFBSSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3JELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGtEQUFrRCxFQUFFLEdBQUcsRUFBRTtnQkFDN0QsSUFBQSxvQkFBVyxFQUFDLElBQUEsd0NBQWtCLEVBQUMsT0FBTyxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3hELElBQUEsb0JBQVcsRUFBQyxJQUFBLHdDQUFrQixFQUFDLE9BQU8sQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUN4RCxJQUFBLG9CQUFXLEVBQUMsSUFBQSx3Q0FBa0IsRUFBQyxPQUFPLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN6RCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtZQUMvQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO2dCQUM1QixNQUFNLE1BQU0sR0FBRztvQkFDZCxDQUFDLEVBQUUsR0FBRztpQkFDTixDQUFDO2dCQUNGLE1BQU0sS0FBSyxHQUFHO29CQUNiLENBQUMsRUFBRSxHQUFHO2lCQUNOLENBQUM7Z0JBQ0YsSUFBQSx1Q0FBaUIsRUFBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2pDLElBQUEsd0JBQWUsRUFBQyxNQUFNLEVBQUU7b0JBQ3ZCLENBQUMsRUFBRSxHQUFHO29CQUNOLENBQUMsRUFBRSxHQUFHO2lCQUNOLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBRUgsQ0FBQyxDQUFDLG9CQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtnQkFDaEYsTUFBTSxNQUFNLEdBQUc7b0JBQ2QsQ0FBQyxFQUFFLEdBQUc7aUJBQ04sQ0FBQztnQkFDRixNQUFNLEtBQUssR0FBRztvQkFDYixDQUFDLEVBQUUsR0FBRztpQkFDTixDQUFDO2dCQUNGLElBQUEsdUNBQWlCLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxJQUFBLHdCQUFlLEVBQUMsTUFBTSxFQUFFO29CQUN2QixDQUFDLEVBQUUsR0FBRztpQkFDTixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxvREFBb0QsRUFBRSxHQUFHLEVBQUU7Z0JBQy9ELE1BQU0sTUFBTSxHQUFHO29CQUNkLENBQUMsRUFBRSxHQUFHO29CQUNOLENBQUMsRUFBRSxHQUFHO2lCQUNOLENBQUM7Z0JBQ0YsTUFBTSxLQUFLLEdBQXFDO29CQUMvQyxDQUFDLEVBQUUsSUFBSTtpQkFDUCxDQUFDO2dCQUNGLElBQUEsdUNBQWlCLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxJQUFBLHdCQUFlLEVBQUMsTUFBTSxFQUFFO29CQUN2QixDQUFDLEVBQUUsR0FBRztpQkFDTixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztZQUVILENBQUMsQ0FBQyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyw2RUFBNkUsRUFBRSxHQUFHLEVBQUU7Z0JBQ25ILE1BQU0sTUFBTSxHQUFHO29CQUNkLENBQUMsRUFBRSxHQUFHO29CQUNOLENBQUMsRUFBRSxHQUFHO2lCQUNOLENBQUM7Z0JBQ0YsTUFBTSxLQUFLLEdBQXFDO29CQUMvQyxDQUFDLEVBQUUsSUFBSTtpQkFDUCxDQUFDO2dCQUNGLElBQUEsdUNBQWlCLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxJQUFBLHdCQUFlLEVBQUMsTUFBTSxFQUFFO29CQUN2QixDQUFDLEVBQUUsR0FBRztpQkFDTixDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDcEIsbUVBQW1FO1lBQ25FLFNBQVMsZ0JBQWdCLENBQUMsQ0FBUyxFQUFFLENBQVM7Z0JBQzdDLElBQUEsb0JBQVcsRUFBQyxTQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELENBQUM7WUFFRCxJQUFJLENBQUMsbURBQW1ELEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3BFLGdCQUFnQixDQUFDLE1BQU0sSUFBQSw0QkFBTSxFQUFDLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDbEksQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsMENBQTBDLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQzNELGdCQUFnQixDQUFDLE1BQU0sSUFBQSw0QkFBTSxFQUFDLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ25JLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLHlDQUF5QyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUMxRCxnQkFBZ0IsQ0FBQyxNQUFNLElBQUEsNEJBQU0sRUFBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pILENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLG1FQUFtRSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNwRixnQkFBZ0IsQ0FBQyxNQUFNLElBQUEsNEJBQU0sRUFBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDbEksZ0JBQWdCLENBQUMsTUFBTSxJQUFBLDRCQUFNLEVBQUMsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3BJLGdCQUFnQixDQUFDLE1BQU0sSUFBQSw0QkFBTSxFQUFDLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xJLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLDJFQUEyRSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUM1RixnQkFBZ0IsQ0FBQyxNQUFNLElBQUEsNEJBQU0sRUFBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUM3SCxnQkFBZ0IsQ0FBQyxNQUFNLElBQUEsNEJBQU0sRUFBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUMvSCxnQkFBZ0IsQ0FBQyxNQUFNLElBQUEsNEJBQU0sRUFBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ2pJLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLDhDQUE4QyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUMvRCxnQkFBZ0IsQ0FBQyxNQUFNLElBQUEsNEJBQU0sRUFBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDOUosQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7WUFDakMsTUFBTSxjQUFjLEdBQUc7Z0JBQ3RCLFVBQVUsRUFBRSxLQUFLLEVBQUUsUUFBZ0IsRUFBRSxTQUF3QyxFQUFFLEVBQUU7b0JBQ2hGLElBQUksU0FBUyxLQUFLLGFBQWEsRUFBRTt3QkFDaEMsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO3dCQUN6RSxNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUUsTUFBTSxDQUFDO3dCQUM3QixJQUFJLENBQUMsTUFBTSxFQUFFOzRCQUNaLE9BQU8sUUFBUSxDQUFDO3lCQUNoQjt3QkFDRCxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztxQkFDL0Q7b0JBQ0QsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO29CQUNqRSxNQUFNLE1BQU0sR0FBRyxLQUFLLEVBQUUsTUFBTSxDQUFDO29CQUM3QixJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNaLE9BQU8sUUFBUSxDQUFDO3FCQUNoQjtvQkFDRCxPQUFPLFFBQVEsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDaEYsQ0FBQzthQUNELENBQUM7WUFDRixLQUFLLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO2dCQUMvQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQ2pDLElBQUEsb0JBQVcsRUFBQyxNQUFNLElBQUEseUNBQW1CLEVBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxLQUFLLDhDQUFrQyxjQUFjLG1DQUEyQixJQUFJLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDcEssSUFBQSxvQkFBVyxFQUFDLE1BQU0sSUFBQSx5Q0FBbUIsRUFBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsS0FBSyw4Q0FBa0MsY0FBYyxtQ0FBMkIsSUFBSSxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztvQkFDN0ssSUFBQSxvQkFBVyxFQUFDLE1BQU0sSUFBQSx5Q0FBbUIsRUFBQyw2QkFBNkIsRUFBRSxLQUFLLEVBQUUsS0FBSyw4Q0FBa0MsY0FBYyxtQ0FBMkIsSUFBSSxDQUFDLEVBQUUsK0JBQStCLENBQUMsQ0FBQztnQkFDck0sQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDN0IsSUFBQSxvQkFBVyxFQUFDLE1BQU0sSUFBQSx5Q0FBbUIsRUFBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLE1BQU0sNENBQStCLGNBQWMsbUNBQTJCLElBQUksQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUNuSyxJQUFBLG9CQUFXLEVBQUMsTUFBTSxJQUFBLHlDQUFtQixFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxNQUFNLDRDQUErQixjQUFjLG1DQUEyQixJQUFJLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO29CQUNqTCxJQUFBLG9CQUFXLEVBQUMsTUFBTSxJQUFBLHlDQUFtQixFQUFDLDZCQUE2QixFQUFFLE1BQU0sRUFBRSxNQUFNLDRDQUErQixjQUFjLG1DQUEyQixJQUFJLENBQUMsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO2dCQUN0TSxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUMzQixJQUFBLG9CQUFXLEVBQUMsTUFBTSxJQUFBLHlDQUFtQixFQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsTUFBTSw0Q0FBNEIsY0FBYyxtQ0FBMkIsSUFBSSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ2hLLElBQUEsb0JBQVcsRUFBQyxNQUFNLElBQUEseUNBQW1CLEVBQUMsNkJBQTZCLEVBQUUsTUFBTSxFQUFFLE1BQU0sNENBQTRCLGNBQWMsbUNBQTJCLElBQUksQ0FBQyxFQUFFLDRCQUE0QixDQUFDLENBQUM7Z0JBQzlMLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQ3RCLElBQUEsb0JBQVcsRUFBQyxNQUFNLElBQUEseUNBQW1CLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxNQUFNLG9DQUF3QixjQUFjLG1DQUEyQixJQUFJLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMvSixDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtnQkFDN0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDdkIsSUFBQSxvQkFBVyxFQUFDLE1BQU0sSUFBQSx5Q0FBbUIsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0NBQXVCLGNBQWMsaUNBQXlCLElBQUksQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUNuSixJQUFBLG9CQUFXLEVBQUMsTUFBTSxJQUFBLHlDQUFtQixFQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsTUFBTSxvQ0FBdUIsY0FBYyxpQ0FBeUIsSUFBSSxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7b0JBQzNKLElBQUEsb0JBQVcsRUFBQyxNQUFNLElBQUEseUNBQW1CLEVBQUMseUJBQXlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0NBQXVCLGNBQWMsaUNBQXlCLElBQUksQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUM7Z0JBQ2pMLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7WUFDSCxLQUFLLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQ2pDLElBQUEsb0JBQVcsRUFBQyxNQUFNLElBQUEseUNBQW1CLEVBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxLQUFLLDhDQUFrQyxjQUFjLG1DQUEyQixLQUFLLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDckssSUFBQSxvQkFBVyxFQUFDLE1BQU0sSUFBQSx5Q0FBbUIsRUFBQyxtQkFBbUIsRUFBRSxLQUFLLEVBQUUsS0FBSyw4Q0FBa0MsY0FBYyxtQ0FBMkIsS0FBSyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztvQkFDOUssSUFBQSxvQkFBVyxFQUFDLE1BQU0sSUFBQSx5Q0FBbUIsRUFBQyw2QkFBNkIsRUFBRSxLQUFLLEVBQUUsS0FBSyw4Q0FBa0MsY0FBYyxtQ0FBMkIsS0FBSyxDQUFDLEVBQUUsK0JBQStCLENBQUMsQ0FBQztnQkFDdE0sQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDN0IsSUFBQSxvQkFBVyxFQUFDLE1BQU0sSUFBQSx5Q0FBbUIsRUFBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLE1BQU0sNENBQStCLGNBQWMsbUNBQTJCLEtBQUssQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUNwSyxJQUFBLG9CQUFXLEVBQUMsTUFBTSxJQUFBLHlDQUFtQixFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxNQUFNLDRDQUErQixjQUFjLG1DQUEyQixLQUFLLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO29CQUNsTCxJQUFBLG9CQUFXLEVBQUMsTUFBTSxJQUFBLHlDQUFtQixFQUFDLDZCQUE2QixFQUFFLE1BQU0sRUFBRSxNQUFNLDRDQUErQixjQUFjLG1DQUEyQixLQUFLLENBQUMsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO2dCQUN2TSxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssSUFBSSxFQUFFO29CQUMzQixJQUFBLG9CQUFXLEVBQUMsTUFBTSxJQUFBLHlDQUFtQixFQUFDLGNBQWMsRUFBRSxNQUFNLEVBQUUsTUFBTSw0Q0FBNEIsY0FBYyxtQ0FBMkIsS0FBSyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ2pLLElBQUEsb0JBQVcsRUFBQyxNQUFNLElBQUEseUNBQW1CLEVBQUMsNkJBQTZCLEVBQUUsTUFBTSxFQUFFLE1BQU0sNENBQTRCLGNBQWMsbUNBQTJCLEtBQUssQ0FBQyxFQUFFLDRCQUE0QixDQUFDLENBQUM7Z0JBQy9MLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQ3RCLElBQUEsb0JBQVcsRUFBQyxNQUFNLElBQUEseUNBQW1CLEVBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxNQUFNLG9DQUF3QixjQUFjLG1DQUEyQixLQUFLLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNoSyxDQUFDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksRUFBRTtvQkFDdkIsSUFBQSxvQkFBVyxFQUFDLE1BQU0sSUFBQSx5Q0FBbUIsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0NBQXVCLGNBQWMsaUNBQXlCLEtBQUssQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUNwSixJQUFBLG9CQUFXLEVBQUMsTUFBTSxJQUFBLHlDQUFtQixFQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsTUFBTSxvQ0FBdUIsY0FBYyxpQ0FBeUIsS0FBSyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7b0JBQzVKLElBQUEsb0JBQVcsRUFBQyxNQUFNLElBQUEseUNBQW1CLEVBQUMseUJBQXlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0NBQXVCLGNBQWMsaUNBQXlCLEtBQUssQ0FBQyxFQUFFLDBCQUEwQixDQUFDLENBQUM7Z0JBQ2xMLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7WUFDdkMsTUFBTSxlQUFlLEdBQUc7Z0JBQ3ZCLFNBQVMsRUFBRSxXQUFXO2dCQUN0QixZQUFZLEVBQUUsUUFBUTthQUN0QixDQUFDO1lBQ0YsSUFBSSxDQUFDLG1EQUFtRCxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNwRSxJQUFBLHdCQUFlLEVBQ2QsTUFBTSxJQUFBLCtDQUF5QixFQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN0RyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLGVBQWUsRUFBRSxDQUM3QyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=