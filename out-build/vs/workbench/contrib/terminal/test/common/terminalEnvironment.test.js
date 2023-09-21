/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/base/test/common/utils"], function (require, exports, assert_1, platform_1, uri_1, terminalEnvironment_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TerminalEnvironment', () => {
        (0, utils_1.$bT)();
        suite('addTerminalEnvironmentKeys', () => {
            test('should set expected variables', () => {
                const env = {};
                (0, terminalEnvironment_1.$UM)(env, '1.2.3', 'en', 'on');
                (0, assert_1.strictEqual)(env['TERM_PROGRAM'], 'vscode');
                (0, assert_1.strictEqual)(env['TERM_PROGRAM_VERSION'], '1.2.3');
                (0, assert_1.strictEqual)(env['COLORTERM'], 'truecolor');
                (0, assert_1.strictEqual)(env['LANG'], 'en_US.UTF-8');
            });
            test('should use language variant for LANG that is provided in locale', () => {
                const env = {};
                (0, terminalEnvironment_1.$UM)(env, '1.2.3', 'en-au', 'on');
                (0, assert_1.strictEqual)(env['LANG'], 'en_AU.UTF-8', 'LANG is equal to the requested locale with UTF-8');
            });
            test('should fallback to en_US when no locale is provided', () => {
                const env2 = { FOO: 'bar' };
                (0, terminalEnvironment_1.$UM)(env2, '1.2.3', undefined, 'on');
                (0, assert_1.strictEqual)(env2['LANG'], 'en_US.UTF-8', 'LANG is equal to en_US.UTF-8 as fallback.'); // More info on issue #14586
            });
            test('should fallback to en_US when an invalid locale is provided', () => {
                const env3 = { LANG: 'replace' };
                (0, terminalEnvironment_1.$UM)(env3, '1.2.3', undefined, 'on');
                (0, assert_1.strictEqual)(env3['LANG'], 'en_US.UTF-8', 'LANG is set to the fallback LANG');
            });
            test('should override existing LANG', () => {
                const env4 = { LANG: 'en_AU.UTF-8' };
                (0, terminalEnvironment_1.$UM)(env4, '1.2.3', undefined, 'on');
                (0, assert_1.strictEqual)(env4['LANG'], 'en_US.UTF-8', 'LANG is equal to the parent environment\'s LANG');
            });
        });
        suite('shouldSetLangEnvVariable', () => {
            test('auto', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({}, 'auto'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US' }, 'auto'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US.utf' }, 'auto'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US.utf8' }, 'auto'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US.UTF-8' }, 'auto'), false);
            });
            test('off', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({}, 'off'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US' }, 'off'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US.utf' }, 'off'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US.utf8' }, 'off'), false);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US.UTF-8' }, 'off'), false);
            });
            test('on', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({}, 'on'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US' }, 'on'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US.utf' }, 'on'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US.utf8' }, 'on'), true);
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$VM)({ LANG: 'en-US.UTF-8' }, 'on'), true);
            });
        });
        suite('getLangEnvVariable', () => {
            test('should fallback to en_US when no locale is provided', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)(undefined), 'en_US.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)(''), 'en_US.UTF-8');
            });
            test('should fallback to default language variants when variant isn\'t provided', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('af'), 'af_ZA.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('am'), 'am_ET.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('be'), 'be_BY.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('bg'), 'bg_BG.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('ca'), 'ca_ES.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('cs'), 'cs_CZ.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('da'), 'da_DK.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('de'), 'de_DE.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('el'), 'el_GR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('en'), 'en_US.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('es'), 'es_ES.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('et'), 'et_EE.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('eu'), 'eu_ES.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('fi'), 'fi_FI.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('fr'), 'fr_FR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('he'), 'he_IL.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('hr'), 'hr_HR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('hu'), 'hu_HU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('hy'), 'hy_AM.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('is'), 'is_IS.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('it'), 'it_IT.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('ja'), 'ja_JP.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('kk'), 'kk_KZ.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('ko'), 'ko_KR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('lt'), 'lt_LT.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('nl'), 'nl_NL.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('no'), 'no_NO.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('pl'), 'pl_PL.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('pt'), 'pt_BR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('ro'), 'ro_RO.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('ru'), 'ru_RU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('sk'), 'sk_SK.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('sl'), 'sl_SI.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('sr'), 'sr_YU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('sv'), 'sv_SE.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('tr'), 'tr_TR.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('uk'), 'uk_UA.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('zh'), 'zh_CN.UTF-8');
            });
            test('should set language variant based on full locale', () => {
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('en-AU'), 'en_AU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('en-au'), 'en_AU.UTF-8');
                (0, assert_1.strictEqual)((0, terminalEnvironment_1.$WM)('fa-ke'), 'fa_KE.UTF-8');
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
                (0, terminalEnvironment_1.$TM)(parent, other);
                (0, assert_1.deepStrictEqual)(parent, {
                    a: 'b',
                    c: 'd'
                });
            });
            (!platform_1.$i ? test.skip : test)('should add keys ignoring case on Windows', () => {
                const parent = {
                    a: 'b'
                };
                const other = {
                    A: 'c'
                };
                (0, terminalEnvironment_1.$TM)(parent, other);
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
                (0, terminalEnvironment_1.$TM)(parent, other);
                (0, assert_1.deepStrictEqual)(parent, {
                    c: 'd'
                });
            });
            (!platform_1.$i ? test.skip : test)('null values should delete keys from the parent env ignoring case on Windows', () => {
                const parent = {
                    a: 'b',
                    c: 'd'
                };
                const other = {
                    A: null
                };
                (0, terminalEnvironment_1.$TM)(parent, other);
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
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, undefined), '/userHome/');
            });
            test('should use to the workspace if it exists', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [] }, '/userHome/', undefined, uri_1.URI.file('/foo'), undefined), '/foo');
            });
            test('should use an absolute custom cwd as is', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, '/foo'), '/foo');
            });
            test('should normalize a relative custom cwd against the workspace path', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [] }, '/userHome/', undefined, uri_1.URI.file('/bar'), 'foo'), '/bar/foo');
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [] }, '/userHome/', undefined, uri_1.URI.file('/bar'), './foo'), '/bar/foo');
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [] }, '/userHome/', undefined, uri_1.URI.file('/bar'), '../foo'), '/foo');
            });
            test('should fall back for relative a custom cwd that doesn\'t have a workspace', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, 'foo'), '/userHome/');
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, './foo'), '/userHome/');
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [] }, '/userHome/', undefined, undefined, '../foo'), '/userHome/');
            });
            test('should ignore custom cwd when told to ignore', async () => {
                assertPathsMatch(await (0, terminalEnvironment_1.$XM)({ executable: undefined, args: [], ignoreConfigurationCwd: true }, '/userHome/', undefined, uri_1.URI.file('/bar'), '/foo'), '/bar');
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
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `c:\\foo\\bar`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar\'baz', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `c:\\foo\\bar'baz`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar$(echo evil)baz', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `"c:\\foo\\bar$(echo evil)baz"`);
                });
                test('PowerShell', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `c:\\foo\\bar`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar\'baz', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `& 'c:\\foo\\bar''baz'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar$(echo evil)baz', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `& 'c:\\foo\\bar$(echo evil)baz'`);
                });
                test('Git Bash', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar', 'bash', 'bash', "gitbash" /* WindowsShellType.GitBash */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `'c:/foo/bar'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar$(echo evil)baz', 'bash', 'bash', "gitbash" /* WindowsShellType.GitBash */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), `'c:/foo/bar(echo evil)baz'`);
                });
                test('WSL', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar', 'bash', 'bash', "wsl" /* WindowsShellType.Wsl */, wslPathBackend, 1 /* OperatingSystem.Windows */, true), '/mnt/c/foo/bar');
                });
            });
            suite('Windows frontend, Linux backend', () => {
                test('Bash', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('/foo/bar', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, true), `'/foo/bar'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('/foo/bar\'baz', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, true), `'/foo/barbaz'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('/foo/bar$(echo evil)baz', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, true), `'/foo/bar(echo evil)baz'`);
                });
            });
            suite('Linux frontend, Windows backend', () => {
                test('Command Prompt', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `c:\\foo\\bar`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar\'baz', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `c:\\foo\\bar'baz`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar$(echo evil)baz', 'cmd', 'cmd', "cmd" /* WindowsShellType.CommandPrompt */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `"c:\\foo\\bar$(echo evil)baz"`);
                });
                test('PowerShell', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `c:\\foo\\bar`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar\'baz', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `& 'c:\\foo\\bar''baz'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar$(echo evil)baz', 'pwsh', 'pwsh', "pwsh" /* WindowsShellType.PowerShell */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `& 'c:\\foo\\bar$(echo evil)baz'`);
                });
                test('Git Bash', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar', 'bash', 'bash', "gitbash" /* WindowsShellType.GitBash */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `'c:/foo/bar'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar$(echo evil)baz', 'bash', 'bash', "gitbash" /* WindowsShellType.GitBash */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), `'c:/foo/bar(echo evil)baz'`);
                });
                test('WSL', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('c:\\foo\\bar', 'bash', 'bash', "wsl" /* WindowsShellType.Wsl */, wslPathBackend, 1 /* OperatingSystem.Windows */, false), '/mnt/c/foo/bar');
                });
            });
            suite('Linux frontend, Linux backend', () => {
                test('Bash', async () => {
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('/foo/bar', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, false), `'/foo/bar'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('/foo/bar\'baz', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, false), `'/foo/barbaz'`);
                    (0, assert_1.strictEqual)(await (0, terminalEnvironment_1.$1M)('/foo/bar$(echo evil)baz', 'bash', 'bash', "bash" /* PosixShellType.Bash */, wslPathBackend, 3 /* OperatingSystem.Linux */, false), `'/foo/bar(echo evil)baz'`);
                });
            });
        });
        suite('createTerminalEnvironment', () => {
            const commonVariables = {
                COLORTERM: 'truecolor',
                TERM_PROGRAM: 'vscode'
            };
            test('should retain variables equal to the empty string', async () => {
                (0, assert_1.deepStrictEqual)(await (0, terminalEnvironment_1.$ZM)({}, undefined, undefined, undefined, 'off', { foo: 'bar', empty: '' }), { foo: 'bar', empty: '', ...commonVariables });
            });
        });
    });
});
//# sourceMappingURL=terminalEnvironment.test.js.map