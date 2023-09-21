/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadCommands", "vs/platform/commands/common/commands", "vs/workbench/api/test/common/testRPCProtocol", "vs/base/test/common/mock", "vs/base/test/common/utils"], function (require, exports, assert, mainThreadCommands_1, commands_1, testRPCProtocol_1, mock_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadCommands', function () {
        (0, utils_1.$bT)();
        test('dispose on unregister', function () {
            const commands = new mainThreadCommands_1.$ycb((0, testRPCProtocol_1.$2dc)(null), undefined, new class extends (0, mock_1.$rT)() {
            });
            assert.strictEqual(commands_1.$Gr.getCommand('foo'), undefined);
            // register
            commands.$registerCommand('foo');
            assert.ok(commands_1.$Gr.getCommand('foo'));
            // unregister
            commands.$unregisterCommand('foo');
            assert.strictEqual(commands_1.$Gr.getCommand('foo'), undefined);
            commands.dispose();
        });
        test('unregister all on dispose', function () {
            const commands = new mainThreadCommands_1.$ycb((0, testRPCProtocol_1.$2dc)(null), undefined, new class extends (0, mock_1.$rT)() {
            });
            assert.strictEqual(commands_1.$Gr.getCommand('foo'), undefined);
            commands.$registerCommand('foo');
            commands.$registerCommand('bar');
            assert.ok(commands_1.$Gr.getCommand('foo'));
            assert.ok(commands_1.$Gr.getCommand('bar'));
            commands.dispose();
            assert.strictEqual(commands_1.$Gr.getCommand('foo'), undefined);
            assert.strictEqual(commands_1.$Gr.getCommand('bar'), undefined);
        });
        test('activate and throw when needed', async function () {
            const activations = [];
            const runs = [];
            const commands = new mainThreadCommands_1.$ycb((0, testRPCProtocol_1.$2dc)(null), new class extends (0, mock_1.$rT)() {
                executeCommand(id) {
                    runs.push(id);
                    return Promise.resolve(undefined);
                }
            }, new class extends (0, mock_1.$rT)() {
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
//# sourceMappingURL=mainThreadCommands.test.js.map