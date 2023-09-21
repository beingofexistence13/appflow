/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/platform/log/common/log", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/amdX", "vs/workbench/contrib/terminal/browser/terminalTestHelpers", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert_1, commandDetectionCapability_1, log_1, contextView_1, instantiationServiceMock_1, amdX_1, terminalTestHelpers_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestCommandDetectionCapability extends commandDetectionCapability_1.$Tq {
        clearCommands() {
            this.f.length = 0;
        }
    }
    suite('CommandDetectionCapability', () => {
        let disposables;
        let xterm;
        let capability;
        let addEvents;
        let instantiationService;
        function assertCommands(expectedCommands) {
            (0, assert_1.deepStrictEqual)(capability.commands.map(e => e.command), expectedCommands.map(e => e.command));
            (0, assert_1.deepStrictEqual)(capability.commands.map(e => e.cwd), expectedCommands.map(e => e.cwd));
            (0, assert_1.deepStrictEqual)(capability.commands.map(e => e.exitCode), expectedCommands.map(e => e.exitCode));
            (0, assert_1.deepStrictEqual)(capability.commands.map(e => e.marker?.line), expectedCommands.map(e => e.marker?.line));
            // Ensure timestamps are set and were captured recently
            for (const command of capability.commands) {
                (0, assert_1.ok)(Math.abs(Date.now() - command.timestamp) < 2000);
            }
            (0, assert_1.deepStrictEqual)(addEvents, capability.commands);
            // Clear the commands to avoid re-asserting past commands
            addEvents.length = 0;
            capability.clearCommands();
        }
        async function printStandardCommand(prompt, command, output, cwd, exitCode) {
            if (cwd !== undefined) {
                capability.setCwd(cwd);
            }
            capability.handlePromptStart();
            await (0, terminalTestHelpers_1.$Wfc)(xterm, `\r${prompt}`);
            capability.handleCommandStart();
            await (0, terminalTestHelpers_1.$Wfc)(xterm, command);
            capability.handleCommandExecuted();
            await (0, terminalTestHelpers_1.$Wfc)(xterm, `\r\n${output}\r\n`);
            capability.handleCommandFinished(exitCode);
        }
        setup(async () => {
            disposables = new lifecycle_1.$jc();
            const TerminalCtor = (await (0, amdX_1.$aD)('xterm', 'lib/xterm.js')).Terminal;
            xterm = new TerminalCtor({ allowProposedApi: true, cols: 80 });
            instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
            instantiationService.stub(contextView_1.$WZ, { showContextMenu(delegate) { } });
            capability = disposables.add(new TestCommandDetectionCapability(xterm, new log_1.$fj()));
            addEvents = [];
            capability.onCommandFinished(e => addEvents.push(e));
            assertCommands([]);
        });
        teardown(() => disposables.dispose());
        (0, utils_1.$bT)();
        test('should not add commands when no capability methods are triggered', async () => {
            await (0, terminalTestHelpers_1.$Wfc)(xterm, 'foo\r\nbar\r\n');
            assertCommands([]);
            await (0, terminalTestHelpers_1.$Wfc)(xterm, 'baz\r\n');
            assertCommands([]);
        });
        test('should add commands for expected capability method calls', async () => {
            await printStandardCommand('$ ', 'echo foo', 'foo', undefined, 0);
            assertCommands([{
                    command: 'echo foo',
                    exitCode: 0,
                    cwd: undefined,
                    marker: { line: 0 }
                }]);
        });
        test('should trim the command when command executed appears on the following line', async () => {
            await printStandardCommand('$ ', 'echo foo\r\n', 'foo', undefined, 0);
            assertCommands([{
                    command: 'echo foo',
                    exitCode: 0,
                    cwd: undefined,
                    marker: { line: 0 }
                }]);
        });
        suite('cwd', () => {
            test('should add cwd to commands when it\'s set', async () => {
                await printStandardCommand('$ ', 'echo foo', 'foo', '/home', 0);
                await printStandardCommand('$ ', 'echo bar', 'bar', '/home/second', 0);
                assertCommands([
                    { command: 'echo foo', exitCode: 0, cwd: '/home', marker: { line: 0 } },
                    { command: 'echo bar', exitCode: 0, cwd: '/home/second', marker: { line: 2 } }
                ]);
            });
            test('should add old cwd to commands if no cwd sequence is output', async () => {
                await printStandardCommand('$ ', 'echo foo', 'foo', '/home', 0);
                await printStandardCommand('$ ', 'echo bar', 'bar', undefined, 0);
                assertCommands([
                    { command: 'echo foo', exitCode: 0, cwd: '/home', marker: { line: 0 } },
                    { command: 'echo bar', exitCode: 0, cwd: '/home', marker: { line: 2 } }
                ]);
            });
            test('should use an undefined cwd if it\'s not set initially', async () => {
                await printStandardCommand('$ ', 'echo foo', 'foo', undefined, 0);
                await printStandardCommand('$ ', 'echo bar', 'bar', '/home', 0);
                assertCommands([
                    { command: 'echo foo', exitCode: 0, cwd: undefined, marker: { line: 0 } },
                    { command: 'echo bar', exitCode: 0, cwd: '/home', marker: { line: 2 } }
                ]);
            });
        });
    });
});
//# sourceMappingURL=commandDetectionCapability.test.js.map