/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/terminal/common/capabilities/commandDetectionCapability", "vs/platform/log/common/log", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/amdX", "vs/workbench/contrib/terminal/browser/terminalTestHelpers", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert_1, commandDetectionCapability_1, log_1, contextView_1, instantiationServiceMock_1, amdX_1, terminalTestHelpers_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestCommandDetectionCapability extends commandDetectionCapability_1.CommandDetectionCapability {
        clearCommands() {
            this._commands.length = 0;
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
            await (0, terminalTestHelpers_1.writeP)(xterm, `\r${prompt}`);
            capability.handleCommandStart();
            await (0, terminalTestHelpers_1.writeP)(xterm, command);
            capability.handleCommandExecuted();
            await (0, terminalTestHelpers_1.writeP)(xterm, `\r\n${output}\r\n`);
            capability.handleCommandFinished(exitCode);
        }
        setup(async () => {
            disposables = new lifecycle_1.DisposableStore();
            const TerminalCtor = (await (0, amdX_1.importAMDNodeModule)('xterm', 'lib/xterm.js')).Terminal;
            xterm = new TerminalCtor({ allowProposedApi: true, cols: 80 });
            instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService());
            instantiationService.stub(contextView_1.IContextMenuService, { showContextMenu(delegate) { } });
            capability = disposables.add(new TestCommandDetectionCapability(xterm, new log_1.NullLogService()));
            addEvents = [];
            capability.onCommandFinished(e => addEvents.push(e));
            assertCommands([]);
        });
        teardown(() => disposables.dispose());
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('should not add commands when no capability methods are triggered', async () => {
            await (0, terminalTestHelpers_1.writeP)(xterm, 'foo\r\nbar\r\n');
            assertCommands([]);
            await (0, terminalTestHelpers_1.writeP)(xterm, 'baz\r\n');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZERldGVjdGlvbkNhcGFiaWxpdHkudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL3Rlc3QvYnJvd3Nlci9jYXBhYmlsaXRpZXMvY29tbWFuZERldGVjdGlvbkNhcGFiaWxpdHkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWlCaEcsTUFBTSw4QkFBK0IsU0FBUSx1REFBMEI7UUFDdEUsYUFBYTtZQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUFFRCxLQUFLLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1FBQ3hDLElBQUksV0FBNEIsQ0FBQztRQUVqQyxJQUFJLEtBQWUsQ0FBQztRQUNwQixJQUFJLFVBQTBDLENBQUM7UUFDL0MsSUFBSSxTQUE2QixDQUFDO1FBQ2xDLElBQUksb0JBQThDLENBQUM7UUFFbkQsU0FBUyxjQUFjLENBQUMsZ0JBQTRDO1lBQ25FLElBQUEsd0JBQWUsRUFBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMvRixJQUFBLHdCQUFlLEVBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdkYsSUFBQSx3QkFBZSxFQUFDLFVBQVUsQ0FBQyxRQUFR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