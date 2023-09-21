/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/platform/terminal/common/xterm/shellIntegrationAddon", "vs/platform/log/common/log", "vs/amdX", "vs/workbench/contrib/terminal/browser/terminalTestHelpers", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert_1, sinon, shellIntegrationAddon_1, log_1, amdX_1, terminalTestHelpers_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestShellIntegrationAddon extends shellIntegrationAddon_1.$jib {
        getCommandDetectionMock(terminal) {
            const capability = super.J(terminal);
            this.capabilities.add(2 /* TerminalCapability.CommandDetection */, capability);
            return sinon.mock(capability);
        }
        getCwdDectionMock() {
            const capability = super.I();
            this.capabilities.add(0 /* TerminalCapability.CwdDetection */, capability);
            return sinon.mock(capability);
        }
    }
    suite('ShellIntegrationAddon', () => {
        let store;
        setup(() => store = new lifecycle_1.$jc());
        teardown(() => store.dispose());
        (0, utils_1.$bT)();
        let xterm;
        let shellIntegrationAddon;
        let capabilities;
        setup(async () => {
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            xterm = store.add(new TerminalCtor({ allowProposedApi: true, cols: 80, rows: 30 }));
            shellIntegrationAddon = store.add(new TestShellIntegrationAddon('', true, undefined, new log_1.$fj()));
            xterm.loadAddon(shellIntegrationAddon);
            capabilities = shellIntegrationAddon.capabilities;
        });
        suite('cwd detection', () => {
            test('should activate capability on the cwd sequence (OSC 633 ; P ; Cwd=<cwd> ST)', async () => {
                (0, assert_1.strictEqual)(capabilities.has(0 /* TerminalCapability.CwdDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(0 /* TerminalCapability.CwdDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;P;Cwd=/foo\x07');
                (0, assert_1.strictEqual)(capabilities.has(0 /* TerminalCapability.CwdDetection */), true);
            });
            test('should pass cwd sequence to the capability', async () => {
                const mock = shellIntegrationAddon.getCwdDectionMock();
                mock.expects('updateCwd').once().withExactArgs('/foo');
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;P;Cwd=/foo\x07');
                mock.verify();
            });
            test('detect ITerm sequence: `OSC 1337 ; CurrentDir=<Cwd> ST`', async () => {
                const cases = [
                    ['root', '/', '/'],
                    ['non-root', '/some/path', '/some/path'],
                ];
                for (const x of cases) {
                    const [title, input, expected] = x;
                    const mock = shellIntegrationAddon.getCwdDectionMock();
                    mock.expects('updateCwd').once().withExactArgs(expected).named(title);
                    await (0, terminalTestHelpers_1.$Wfc)(xterm, `\x1b]1337;CurrentDir=${input}\x07`);
                    mock.verify();
                }
            });
            suite('detect `SetCwd` sequence: `OSC 7; scheme://cwd ST`', () => {
                test('should accept well-formatted URLs', async () => {
                    const cases = [
                        // Different hostname values:
                        ['empty hostname, pointing root', 'file:///', '/'],
                        ['empty hostname', 'file:///test-root/local', '/test-root/local'],
                        ['non-empty hostname', 'file://some-hostname/test-root/local', '/test-root/local'],
                        // URL-encoded chars:
                        ['URL-encoded value (1)', 'file:///test-root/%6c%6f%63%61%6c', '/test-root/local'],
                        ['URL-encoded value (2)', 'file:///test-root/local%22', '/test-root/local"'],
                        ['URL-encoded value (3)', 'file:///test-root/local"', '/test-root/local"'],
                    ];
                    for (const x of cases) {
                        const [title, input, expected] = x;
                        const mock = shellIntegrationAddon.getCwdDectionMock();
                        mock.expects('updateCwd').once().withExactArgs(expected).named(title);
                        await (0, terminalTestHelpers_1.$Wfc)(xterm, `\x1b]7;${input}\x07`);
                        mock.verify();
                    }
                });
                test('should ignore ill-formatted URLs', async () => {
                    const cases = [
                        // Different hostname values:
                        ['no hostname, pointing root', 'file://'],
                        // Non-`file` scheme values:
                        ['no scheme (1)', '/test-root'],
                        ['no scheme (2)', '//test-root'],
                        ['no scheme (3)', '///test-root'],
                        ['no scheme (4)', ':///test-root'],
                        ['http', 'http:///test-root'],
                        ['ftp', 'ftp:///test-root'],
                        ['ssh', 'ssh:///test-root'],
                    ];
                    for (const x of cases) {
                        const [title, input] = x;
                        const mock = shellIntegrationAddon.getCwdDectionMock();
                        mock.expects('updateCwd').never().named(title);
                        await (0, terminalTestHelpers_1.$Wfc)(xterm, `\x1b]7;${input}\x07`);
                        mock.verify();
                    }
                });
            });
            test('detect `SetWindowsFrindlyCwd` sequence: `OSC 9 ; 9 ; <cwd> ST`', async () => {
                const cases = [
                    ['root', '/', '/'],
                    ['non-root', '/some/path', '/some/path'],
                ];
                for (const x of cases) {
                    const [title, input, expected] = x;
                    const mock = shellIntegrationAddon.getCwdDectionMock();
                    mock.expects('updateCwd').once().withExactArgs(expected).named(title);
                    await (0, terminalTestHelpers_1.$Wfc)(xterm, `\x1b]9;9;${input}\x07`);
                    mock.verify();
                }
            });
        });
        suite('command tracking', () => {
            test('should activate capability on the prompt start sequence (OSC 633 ; A ST)', async () => {
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;A\x07');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), true);
            });
            test('should pass prompt start sequence to the capability', async () => {
                const mock = shellIntegrationAddon.getCommandDetectionMock(xterm);
                mock.expects('handlePromptStart').once().withExactArgs();
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;A\x07');
                mock.verify();
            });
            test('should activate capability on the command start sequence (OSC 633 ; B ST)', async () => {
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;B\x07');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), true);
            });
            test('should pass command start sequence to the capability', async () => {
                const mock = shellIntegrationAddon.getCommandDetectionMock(xterm);
                mock.expects('handleCommandStart').once().withExactArgs();
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;B\x07');
                mock.verify();
            });
            test('should activate capability on the command executed sequence (OSC 633 ; C ST)', async () => {
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;C\x07');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), true);
            });
            test('should pass command executed sequence to the capability', async () => {
                const mock = shellIntegrationAddon.getCommandDetectionMock(xterm);
                mock.expects('handleCommandExecuted').once().withExactArgs();
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;C\x07');
                mock.verify();
            });
            test('should activate capability on the command finished sequence (OSC 633 ; D ; <ExitCode> ST)', async () => {
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;D;7\x07');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), true);
            });
            test('should pass command finished sequence to the capability', async () => {
                const mock = shellIntegrationAddon.getCommandDetectionMock(xterm);
                mock.expects('handleCommandFinished').once().withExactArgs(7);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;D;7\x07');
                mock.verify();
            });
            test('should pass command line sequence to the capability', async () => {
                const mock = shellIntegrationAddon.getCommandDetectionMock(xterm);
                mock.expects('setCommandLine').once().withExactArgs('', false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;E\x07');
                mock.verify();
                const mock2 = shellIntegrationAddon.getCommandDetectionMock(xterm);
                mock2.expects('setCommandLine').twice().withExactArgs('cmd', false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;E;cmd\x07');
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;E;cmd;invalid-nonce\x07');
                mock2.verify();
            });
            test('should not activate capability on the cwd sequence (OSC 633 ; P=Cwd=<cwd> ST)', async () => {
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;P;Cwd=/foo\x07');
                (0, assert_1.strictEqual)(capabilities.has(2 /* TerminalCapability.CommandDetection */), false);
            });
            test('should pass cwd sequence to the capability if it\'s initialized', async () => {
                const mock = shellIntegrationAddon.getCommandDetectionMock(xterm);
                mock.expects('setCwd').once().withExactArgs('/foo');
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;P;Cwd=/foo\x07');
                mock.verify();
            });
        });
        suite('BufferMarkCapability', () => {
            test('SetMark', async () => {
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;SetMark;\x07');
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), true);
            });
            test('SetMark - ID', async () => {
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;SetMark;1;\x07');
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), true);
            });
            test('SetMark - hidden', async () => {
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;SetMark;;Hidden\x07');
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), true);
            });
            test('SetMark - hidden & ID', async () => {
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo');
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), false);
                await (0, terminalTestHelpers_1.$Wfc)(xterm, '\x1b]633;SetMark;1;Hidden\x07');
                (0, assert_1.strictEqual)(capabilities.has(4 /* TerminalCapability.BufferMarkDetection */), true);
            });
            suite('parseMarkSequence', () => {
                test('basic', async () => {
                    (0, assert_1.deepEqual)((0, shellIntegrationAddon_1.$mib)(['', '']), { id: undefined, hidden: false });
                });
                test('ID', async () => {
                    (0, assert_1.deepEqual)((0, shellIntegrationAddon_1.$mib)(['Id=3', '']), { id: "3", hidden: false });
                });
                test('hidden', async () => {
                    (0, assert_1.deepEqual)((0, shellIntegrationAddon_1.$mib)(['', 'Hidden']), { id: undefined, hidden: true });
                });
                test('ID + hidden', async () => {
                    (0, assert_1.deepEqual)((0, shellIntegrationAddon_1.$mib)(['Id=4555', 'Hidden']), { id: "4555", hidden: true });
                });
            });
        });
        suite('deserializeMessage', () => {
            // A single literal backslash, in order to avoid confusion about whether we are escaping test data or testing escapes.
            const Backslash = '\\';
            const Newline = '\n';
            const Semicolon = ';';
            const cases = [
                ['empty', '', ''],
                ['basic', 'value', 'value'],
                ['space', 'some thing', 'some thing'],
                ['escaped backslash', `${Backslash}${Backslash}`, Backslash],
                ['non-initial escaped backslash', `foo${Backslash}${Backslash}`, `foo${Backslash}`],
                ['two escaped backslashes', `${Backslash}${Backslash}${Backslash}${Backslash}`, `${Backslash}${Backslash}`],
                ['escaped backslash amidst text', `Hello${Backslash}${Backslash}there`, `Hello${Backslash}there`],
                ['backslash escaped literally and as hex', `${Backslash}${Backslash} is same as ${Backslash}x5c`, `${Backslash} is same as ${Backslash}`],
                ['escaped semicolon', `${Backslash}x3b`, Semicolon],
                ['non-initial escaped semicolon', `foo${Backslash}x3b`, `foo${Semicolon}`],
                ['escaped semicolon (upper hex)', `${Backslash}x3B`, Semicolon],
                ['escaped backslash followed by literal "x3b" is not a semicolon', `${Backslash}${Backslash}x3b`, `${Backslash}x3b`],
                ['non-initial escaped backslash followed by literal "x3b" is not a semicolon', `foo${Backslash}${Backslash}x3b`, `foo${Backslash}x3b`],
                ['escaped backslash followed by escaped semicolon', `${Backslash}${Backslash}${Backslash}x3b`, `${Backslash}${Semicolon}`],
                ['escaped semicolon amidst text', `some${Backslash}x3bthing`, `some${Semicolon}thing`],
                ['escaped newline', `${Backslash}x0a`, Newline],
                ['non-initial escaped newline', `foo${Backslash}x0a`, `foo${Newline}`],
                ['escaped newline (upper hex)', `${Backslash}x0A`, Newline],
                ['escaped backslash followed by literal "x0a" is not a newline', `${Backslash}${Backslash}x0a`, `${Backslash}x0a`],
                ['non-initial escaped backslash followed by literal "x0a" is not a newline', `foo${Backslash}${Backslash}x0a`, `foo${Backslash}x0a`],
            ];
            cases.forEach(([title, input, expected]) => {
                test(title, () => (0, assert_1.strictEqual)((0, shellIntegrationAddon_1.$kib)(input), expected));
            });
        });
        test('parseKeyValueAssignment', () => {
            const cases = [
                ['empty', '', ['', undefined]],
                ['no "=" sign', 'some-text', ['some-text', undefined]],
                ['empty value', 'key=', ['key', '']],
                ['empty key', '=value', ['', 'value']],
                ['normal', 'key=value', ['key', 'value']],
                ['multiple "=" signs (1)', 'key==value', ['key', '=value']],
                ['multiple "=" signs (2)', 'key=value===true', ['key', 'value===true']],
                ['just a "="', '=', ['', '']],
                ['just a "=="', '==', ['', '=']],
            ];
            cases.forEach(x => {
                const [title, input, [key, value]] = x;
                (0, assert_1.deepStrictEqual)((0, shellIntegrationAddon_1.$lib)(input), { key, value }, title);
            });
        });
    });
});
//# sourceMappingURL=shellIntegrationAddon.test.js.map