define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/commands/common/commands"], function (require, exports, assert, lifecycle_1, utils_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Command Tests', function () {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('register command - no handler', function () {
            assert.throws(() => commands_1.CommandsRegistry.registerCommand('foo', null));
        });
        test('register/dispose', () => {
            const command = function () { };
            const reg = commands_1.CommandsRegistry.registerCommand('foo', command);
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command);
            reg.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo') === undefined);
        });
        test('register/register/dispose', () => {
            const command1 = function () { };
            const command2 = function () { };
            // dispose overriding command
            let reg1 = commands_1.CommandsRegistry.registerCommand('foo', command1);
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command1);
            let reg2 = commands_1.CommandsRegistry.registerCommand('foo', command2);
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command2);
            reg2.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command1);
            reg1.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo') === undefined);
            // dispose override command first
            reg1 = commands_1.CommandsRegistry.registerCommand('foo', command1);
            reg2 = commands_1.CommandsRegistry.registerCommand('foo', command2);
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command2);
            reg1.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo').handler === command2);
            reg2.dispose();
            assert.ok(commands_1.CommandsRegistry.getCommand('foo') === undefined);
        });
        test('command with description', function () {
            const r1 = commands_1.CommandsRegistry.registerCommand('test', function (accessor, args) {
                assert.ok(typeof args === 'string');
            });
            const r2 = commands_1.CommandsRegistry.registerCommand('test2', function (accessor, args) {
                assert.ok(typeof args === 'string');
            });
            const r3 = commands_1.CommandsRegistry.registerCommand({
                id: 'test3',
                handler: function (accessor, args) {
                    return true;
                },
                description: {
                    description: 'a command',
                    args: [{ name: 'value', constraint: Number }]
                }
            });
            commands_1.CommandsRegistry.getCommands().get('test').handler.apply(undefined, [undefined, 'string']);
            commands_1.CommandsRegistry.getCommands().get('test2').handler.apply(undefined, [undefined, 'string']);
            assert.throws(() => commands_1.CommandsRegistry.getCommands().get('test3').handler.apply(undefined, [undefined, 'string']));
            assert.strictEqual(commands_1.CommandsRegistry.getCommands().get('test3').handler.apply(undefined, [undefined, 1]), true);
            (0, lifecycle_1.combinedDisposable)(r1, r2, r3).dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2NvbW1hbmRzL3Rlc3QvY29tbW9uL2NvbW1hbmRzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsS0FBSyxDQUFDLGVBQWUsRUFBRTtRQUV0QixJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLCtCQUErQixFQUFFO1lBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsMkJBQWdCLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxJQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtZQUM3QixNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsQ0FBQztZQUNoQyxNQUFNLEdBQUcsR0FBRywyQkFBZ0IsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxFQUFFLENBQUMsMkJBQWdCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRSxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsQ0FBQztZQUNuRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZCxNQUFNLENBQUMsRUFBRSxDQUFDLDJCQUFnQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQztRQUM3RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7WUFDdEMsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLENBQUM7WUFDakMsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLENBQUM7WUFFakMsNkJBQTZCO1lBQzdCLElBQUksSUFBSSxHQUFHLDJCQUFnQixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVB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