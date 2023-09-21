/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadCommands", "vs/platform/commands/common/commands", "vs/workbench/api/test/common/testRPCProtocol", "vs/base/test/common/mock", "vs/base/test/common/utils"], function (require, exports, assert, mainThreadCommands_1, commands_1, testRPCProtocol_1, mock_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadCommands', function () {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('dispose on unregister', function () {
            const commands = new mainThreadCommands_1.MainThreadCommands((0, testRPCProtocol_1.SingleProxyRPCProtocol)(null), undefined, new class extends (0, mock_1.mock)() {
            });
            assert.strictEqual(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            // register
            commands.$registerCommand('foo');
            assert.ok(commands_1.CommandsRegistry.getCommand('foo'));
            // unregister
            commands.$unregisterCommand('foo');
            assert.strictEqual(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            commands.dispose();
        });
        test('unregister all on dispose', function () {
            const commands = new mainThreadCommands_1.MainThreadCommands((0, testRPCProtocol_1.SingleProxyRPCProtocol)(null), undefined, new class extends (0, mock_1.mock)() {
            });
            assert.strictEqual(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            commands.$registerCommand('foo');
            commands.$registerCommand('bar');
            assert.ok(commands_1.CommandsRegistry.getCommand('foo'));
            assert.ok(commands_1.CommandsRegistry.getCommand('bar'));
            commands.dispose();
            assert.strictEqual(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            assert.strictEqual(commands_1.CommandsRegistry.getCommand('bar'), undefined);
        });
        test('activate and throw when needed', async function () {
            const activations = [];
            const runs = [];
            const commands = new mainThreadCommands_1.MainThreadCommands((0, testRPCProtocol_1.SingleProxyRPCProtocol)(null), new class extends (0, mock_1.mock)() {
                executeCommand(id) {
                    runs.push(id);
                    return Promise.resolve(undefined);
                }
            }, new class extends (0, mock_1.mock)() {
                activateByEvent(id) {
                    activations.push(id);
                    return Promise.resolve();
                }
            });
            // case 1: arguments and retry
            try {
                activations.length = 0;
                await commands.$executeCommand('bazz', [1, 2, { n: 3 }], true);
                assert.ok(false);
            }
            catch (e) {
                assert.deepStrictEqual(activations, ['onCommand:bazz']);
                assert.strictEqual(e.message, '$executeCommand:retry');
            }
            // case 2: no arguments and retry
            runs.length = 0;
            await commands.$executeCommand('bazz', [], true);
            assert.deepStrictEqual(runs, ['bazz']);
            // case 3: arguments and no retry
            runs.length = 0;
            await commands.$executeCommand('bazz', [1, 2, true], false);
            assert.deepStrictEqual(runs, ['bazz']);
            commands.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENvbW1hbmRzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9tYWluVGhyZWFkQ29tbWFuZHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVVoRyxLQUFLLENBQUMsb0JBQW9CLEVBQUU7UUFFM0IsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtZQUU3QixNQUFNLFFBQVEsR0FBRyxJQUFJLHVDQUFrQixDQUFDLElBQUEsd0NBQXNCLEVBQUMsSUFBSSxDQUFDLEVBQUUsU0FBVSxFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUFxQjthQUFJLENBQUMsQ0FBQztZQUNuSSxNQUFNLENBQUMsV0FBVyxDQUFDLDJCQUFnQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVsRSxXQUFXO1lBQ1gsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxFQUFFLENBQUMsMkJBQWdCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFOUMsYUFBYTtZQUNiLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsV0FBVyxDQUFDLDJCQUFnQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVsRSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFcEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMkJBQTJCLEVBQUU7WUFFakMsTUFBTSxRQUFRLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxJQUFBLHdDQUFzQixFQUFDLElBQUksQ0FBQyxFQUFFLFNBQVUs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