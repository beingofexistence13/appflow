define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/workbench/services/commands/common/commandService", "vs/workbench/services/extensions/common/extensions", "vs/platform/instantiation/common/instantiationService", "vs/platform/log/common/log"], function (require, exports, assert, lifecycle_1, commands_1, commandService_1, extensions_1, instantiationService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CommandService', function () {
        let commandRegistration;
        setup(function () {
            commandRegistration = commands_1.CommandsRegistry.registerCommand('foo', function () { });
        });
        teardown(function () {
            commandRegistration.dispose();
        });
        test('activateOnCommand', () => {
            let lastEvent;
            const service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), new class extends extensions_1.NullExtensionService {
                activateByEvent(activationEvent) {
                    lastEvent = activationEvent;
                    return super.activateByEvent(activationEvent);
                }
            }, new log_1.NullLogService());
            return service.executeCommand('foo').then(() => {
                assert.ok(lastEvent, 'onCommand:foo');
                return service.executeCommand('unknownCommandId');
            }).then(() => {
                assert.ok(false);
            }, () => {
                assert.ok(lastEvent, 'onCommand:unknownCommandId');
            });
        });
        test('fwd activation error', async function () {
            const extensionService = new class extends extensions_1.NullExtensionService {
                activateByEvent(activationEvent) {
                    return Promise.reject(new Error('bad_activate'));
                }
            };
            const service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), extensionService, new log_1.NullLogService());
            await extensionService.whenInstalledExtensionsRegistered();
            return service.executeCommand('foo').then(() => assert.ok(false), err => {
                assert.strictEqual(err.message, 'bad_activate');
            });
        });
        test('!onReady, but executeCommand', function () {
            let callCounter = 0;
            const reg = commands_1.CommandsRegistry.registerCommand('bar', () => callCounter += 1);
            const service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), new class extends extensions_1.NullExtensionService {
                whenInstalledExtensionsRegistered() {
                    return new Promise(_resolve => { });
                }
            }, new log_1.NullLogService());
            service.executeCommand('bar');
            assert.strictEqual(callCounter, 1);
            reg.dispose();
        });
        test('issue #34913: !onReady, unknown command', function () {
            let callCounter = 0;
            let resolveFunc;
            const whenInstalledExtensionsRegistered = new Promise(_resolve => { resolveFunc = _resolve; });
            const service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), new class extends extensions_1.NullExtensionService {
                whenInstalledExtensionsRegistered() {
                    return whenInstalledExtensionsRegistered;
                }
            }, new log_1.NullLogService());
            const r = service.executeCommand('bar');
            assert.strictEqual(callCounter, 0);
            const reg = commands_1.CommandsRegistry.registerCommand('bar', () => callCounter += 1);
            resolveFunc(true);
            return r.then(() => {
                reg.dispose();
                assert.strictEqual(callCounter, 1);
            });
        });
        test('Stop waiting for * extensions to activate when trigger is satisfied #62457', function () {
            let callCounter = 0;
            const disposable = new lifecycle_1.DisposableStore();
            const events = [];
            const service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), new class extends extensions_1.NullExtensionService {
                activateByEvent(event) {
                    events.push(event);
                    if (event === '*') {
                        return new Promise(() => { }); //forever promise...
                    }
                    if (event.indexOf('onCommand:') === 0) {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                const reg = commands_1.CommandsRegistry.registerCommand(event.substr('onCommand:'.length), () => {
                                    callCounter += 1;
                                });
                                disposable.add(reg);
                                resolve();
                            }, 0);
                        });
                    }
                    return Promise.resolve();
                }
            }, new log_1.NullLogService());
            return service.executeCommand('farboo').then(() => {
                assert.strictEqual(callCounter, 1);
                assert.deepStrictEqual(events.sort(), ['*', 'onCommand:farboo'].sort());
            }).finally(() => {
                disposable.dispose();
            });
        });
        test('issue #71471: wait for onCommand activation even if a command is registered', () => {
            const expectedOrder = ['registering command', 'resolving activation event', 'executing command'];
            const actualOrder = [];
            const disposables = new lifecycle_1.DisposableStore();
            const service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), new class extends extensions_1.NullExtensionService {
                activateByEvent(event) {
                    if (event === '*') {
                        return new Promise(() => { }); //forever promise...
                    }
                    if (event.indexOf('onCommand:') === 0) {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                // Register the command after some time
                                actualOrder.push('registering command');
                                const reg = commands_1.CommandsRegistry.registerCommand(event.substr('onCommand:'.length), () => {
                                    actualOrder.push('executing command');
                                });
                                disposables.add(reg);
                                setTimeout(() => {
                                    // Resolve the activation event after some more time
                                    actualOrder.push('resolving activation event');
                                    resolve();
                                }, 10);
                            }, 10);
                        });
                    }
                    return Promise.resolve();
                }
            }, new log_1.NullLogService());
            return service.executeCommand('farboo2').then(() => {
                assert.deepStrictEqual(actualOrder, expectedOrder);
            }).finally(() => {
                disposables.dispose();
            });
        });
        test('issue #142155: execute commands synchronously if possible', async () => {
            const actualOrder = [];
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(commands_1.CommandsRegistry.registerCommand(`bizBaz`, () => {
                actualOrder.push('executing command');
            }));
            const extensionService = new class extends extensions_1.NullExtensionService {
                activationEventIsDone(_activationEvent) {
                    return true;
                }
            };
            const service = new commandService_1.CommandService(new instantiationService_1.InstantiationService(), extensionService, new log_1.NullLogService());
            await extensionService.whenInstalledExtensionsRegistered();
            try {
                actualOrder.push(`before call`);
                const promise = service.executeCommand('bizBaz');
                actualOrder.push(`after call`);
                await promise;
                actualOrder.push(`resolved`);
                assert.deepStrictEqual(actualOrder, [
                    'before call',
                    'executing command',
                    'after call',
                    'resolved'
                ]);
            }
            finally {
                disposables.dispose();
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZFNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9jb21tYW5kcy90ZXN0L2NvbW1vbi9jb21tYW5kU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtRQUV2QixJQUFJLG1CQUFnQyxDQUFDO1FBRXJDLEtBQUssQ0FBQztZQUNMLG1CQUFtQixHQUFHLDJCQUFnQixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNoRixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQztZQUNSLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtZQUU5QixJQUFJLFNBQWlCLENBQUM7WUFFdEIsTUFBTSxPQUFPLEdBQUcsSUFBSSwrQkFBYyxDQUFDLElBQUksMkNBQW9CLEVBQUUsRUFBRSxJQUFJLEtBQU0sU0FBUSxpQ0FBb0I7Z0JBQzNGLGVBQWUsQ0FBQyxlQUF1QjtvQkFDL0MsU0FBUyxHQUFHLGVBQWUsQ0FBQztvQkFDNUIsT0FBTyxLQUFLLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDO2FBQ0QsRUFBRSxJQUFJLG9CQUFjLEVBQUUsQ0FBQyxDQUFDO1lBRXpCLE9BQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUM5QyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDdEMsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUMsSUFBSSxD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