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
            const shape = new class extends (0, mock_1.$rT)() {
                $registerCommand(id) {
                    //
                }
                $unregisterCommand(id) {
                    lastUnregister = id;
                }
            };
            const commands = new extHostCommands_1.$kM((0, testRPCProtocol_1.$2dc)(shape), new log_1.$fj(), new class extends (0, mock_1.$rT)() {
                onExtensionError() {
                    return true;
                }
            });
            commands.registerCommand(true, 'foo', () => { }).dispose();
            assert.strictEqual(lastUnregister, 'foo');
            assert.strictEqual(commands_1.$Gr.getCommand('foo'), undefined);
        });
        test('dispose bubbles only once', function () {
            let unregisterCounter = 0;
            const shape = new class extends (0, mock_1.$rT)() {
                $registerCommand(id) {
                    //
                }
                $unregisterCommand(id) {
                    unregisterCounter += 1;
                }
            };
            const commands = new extHostCommands_1.$kM((0, testRPCProtocol_1.$2dc)(shape), new log_1.$fj(), new class extends (0, mock_1.$rT)() {
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
            const shape = new class extends (0, mock_1.$rT)() {
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
            const commands = new extHostCommands_1.$kM((0, testRPCProtocol_1.$2dc)(shape), new log_1.$fj(), new class extends (0, mock_1.$rT)() {
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
            const shape = new class extends (0, mock_1.$rT)() {
                $registerCommand(id) {
                    //
                }
                $fireCommandActivationEvent(id) {
                    activationEvents.push(id);
                }
            };
            const commands = new extHostCommands_1.$kM((0, testRPCProtocol_1.$2dc)(shape), new log_1.$fj(), new class extends (0, mock_1.$rT)() {
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
//# sourceMappingURL=extHostCommands.test.js.map