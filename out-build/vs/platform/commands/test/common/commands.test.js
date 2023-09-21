define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/commands/common/commands"], function (require, exports, assert, lifecycle_1, utils_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Command Tests', function () {
        (0, utils_1.$bT)();
        test('register command - no handler', function () {
            assert.throws(() => commands_1.$Gr.registerCommand('foo', null));
        });
        test('register/dispose', () => {
            const command = function () { };
            const reg = commands_1.$Gr.registerCommand('foo', command);
            assert.ok(commands_1.$Gr.getCommand('foo').handler === command);
            reg.dispose();
            assert.ok(commands_1.$Gr.getCommand('foo') === undefined);
        });
        test('register/register/dispose', () => {
            const command1 = function () { };
            const command2 = function () { };
            // dispose overriding command
            let reg1 = commands_1.$Gr.registerCommand('foo', command1);
            assert.ok(commands_1.$Gr.getCommand('foo').handler === command1);
            let reg2 = commands_1.$Gr.registerCommand('foo', command2);
            assert.ok(commands_1.$Gr.getCommand('foo').handler === command2);
            reg2.dispose();
            assert.ok(commands_1.$Gr.getCommand('foo').handler === command1);
            reg1.dispose();
            assert.ok(commands_1.$Gr.getCommand('foo') === undefined);
            // dispose override command first
            reg1 = commands_1.$Gr.registerCommand('foo', command1);
            reg2 = commands_1.$Gr.registerCommand('foo', command2);
            assert.ok(commands_1.$Gr.getCommand('foo').handler === command2);
            reg1.dispose();
            assert.ok(commands_1.$Gr.getCommand('foo').handler === command2);
            reg2.dispose();
            assert.ok(commands_1.$Gr.getCommand('foo') === undefined);
        });
        test('command with description', function () {
            const r1 = commands_1.$Gr.registerCommand('test', function (accessor, args) {
                assert.ok(typeof args === 'string');
            });
            const r2 = commands_1.$Gr.registerCommand('test2', function (accessor, args) {
                assert.ok(typeof args === 'string');
            });
            const r3 = commands_1.$Gr.registerCommand({
                id: 'test3',
                handler: function (accessor, args) {
                    return true;
                },
                description: {
                    description: 'a command',
                    args: [{ name: 'value', constraint: Number }]
                }
            });
            commands_1.$Gr.getCommands().get('test').handler.apply(undefined, [undefined, 'string']);
            commands_1.$Gr.getCommands().get('test2').handler.apply(undefined, [undefined, 'string']);
            assert.throws(() => commands_1.$Gr.getCommands().get('test3').handler.apply(undefined, [undefined, 'string']));
            assert.strictEqual(commands_1.$Gr.getCommands().get('test3').handler.apply(undefined, [undefined, 1]), true);
            (0, lifecycle_1.$hc)(r1, r2, r3).dispose();
        });
    });
});
//# sourceMappingURL=commands.test.js.map