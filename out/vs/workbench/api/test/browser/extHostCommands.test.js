/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/common/extHostCommands", "vs/platform/commands/common/commands", "vs/workbench/api/test/common/testRPCProtocol", "vs/base/test/common/mock", "vs/platform/log/common/log"], function (require, exports, assert, extHostCommands_1, commands_1, testRPCProtocol_1, mock_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostCommands', function () {
        test('dispose calls unregister', function () {
            let lastUnregister;
            const shape = new class extends (0, mock_1.mock)() {
                $registerCommand(id) {
                    //
                }
                $unregisterCommand(id) {
                    lastUnregister = id;
                }
            };
            const commands = new extHostCommands_1.ExtHostCommands((0, testRPCProtocol_1.SingleProxyRPCProtocol)(shape), new log_1.NullLogService(), new class extends (0, mock_1.mock)() {
                onExtensionError() {
                    return true;
                }
            });
            commands.registerCommand(true, 'foo', () => { }).dispose();
            assert.strictEqual(lastUnregister, 'foo');
            assert.strictEqual(commands_1.CommandsRegistry.getCommand('foo'), undefined);
        });
        test('dispose bubbles only once', function () {
            let unregisterCounter = 0;
            const shape = new class extends (0, mock_1.mock)() {
                $registerCommand(id) {
                    //
                }
                $unregisterCommand(id) {
                    unregisterCounter += 1;
                }
            };
            const commands = new extHostCommands_1.ExtHostCommands((0, testRPCProtocol_1.SingleProxyRPCProtocol)(shape), new log_1.NullLogService(), new class extends (0, mock_1.mock)() {
                onExtensionError() {
                    return true;
                }
            });
            const reg = commands.registerCommand(true, 'foo', () => { });
            reg.dispose();
            reg.dispose();
            reg.dispose();
            assert.strictEqual(unregisterCounter, 1);
        });
        test('execute with retry', async function () {
            let count = 0;
            const shape = new class extends (0, mock_1.mock)() {
                $registerCommand(id) {
                    //
                }
                async $executeCommand(id, args, retry) {
                    count++;
                    assert.strictEqual(retry, count === 1);
                    if (count === 1) {
                        assert.strictEqual(retry, true);
                        throw new Error('$executeCommand:retry');
                    }
                    else {
                        assert.strictEqual(retry, false);
                        return 17;
                    }
                }
            };
            const commands = new extHostCommands_1.ExtHostCommands((0, testRPCProtocol_1.SingleProxyRPCProtocol)(shape), new log_1.NullLogService(), new class extends (0, mock_1.mock)() {
                onExtensionError() {
                    return true;
                }
            });
            const result = await commands.executeCommand('fooo', [this, true]);
            assert.strictEqual(result, 17);
            assert.strictEqual(count, 2);
        });
        test('onCommand:abc activates extensions when executed from command palette, but not when executed programmatically with vscode.commands.executeCommand #150293', async function () {
            const activationEvents = [];
            const shape = new class extends (0, mock_1.mock)() {
                $registerCommand(id) {
                    //
                }
                $fireCommandActivationEvent(id) {
                    activationEvents.push(id);
                }
            };
            const commands = new extHostCommands_1.ExtHostCommands((0, testRPCProtocol_1.SingleProxyRPCProtocol)(shape), new log_1.NullLogService(), new class extends (0, mock_1.mock)() {
                onExtensionError() {
                    return true;
                }
            });
            commands.registerCommand(true, 'extCmd', (args) => args);
            const result = await commands.executeCommand('extCmd', this);
            assert.strictEqual(result, this);
            assert.deepStrictEqual(activationEvents, ['extCmd']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENvbW1hbmRzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9leHRIb3N0Q29tbWFuZHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVdoRyxLQUFLLENBQUMsaUJBQWlCLEVBQUU7UUFFeEIsSUFBSSxDQUFDLDBCQUEwQixFQUFFO1lBRWhDLElBQUksY0FBc0IsQ0FBQztZQUUzQixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBMkI7Z0JBQ3JELGdCQUFnQixDQUFDLEVBQVU7b0JBQ25DLEVBQUU7Z0JBQ0gsQ0FBQztnQkFDUSxrQkFBa0IsQ0FBQyxFQUFVO29CQUNyQyxjQUFjLEdBQUcsRUFBRSxDQUFDO2dCQUNyQixDQUFDO2FBQ0QsQ0FBQztZQUVGLE1BQU0sUUFBUSxHQUFHLElBQUksaUNBQWUsQ0FDbkMsSUFBQSx3Q0FBc0IsRUFBQyxLQUFLLENBQUMsRUFDN0IsSUFBSSxvQkFBYyxFQUFFLEVBQ3BCLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFxQjtnQkFDakMsZ0JBQWdCO29CQUN4QixPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDO2FBQ0QsQ0FDRCxDQUFDO1lBQ0YsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxXQUFXLENBQUMsMkJBQWdCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRW5FLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDJCQUEyQixFQUFF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