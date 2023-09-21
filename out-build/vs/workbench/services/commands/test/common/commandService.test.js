define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/workbench/services/commands/common/commandService", "vs/workbench/services/extensions/common/extensions", "vs/platform/instantiation/common/instantiationService", "vs/platform/log/common/log"], function (require, exports, assert, lifecycle_1, commands_1, commandService_1, extensions_1, instantiationService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CommandService', function () {
        let commandRegistration;
        setup(function () {
            commandRegistration = commands_1.$Gr.registerCommand('foo', function () { });
        });
        teardown(function () {
            commandRegistration.dispose();
        });
        test('activateOnCommand', () => {
            let lastEvent;
            const service = new commandService_1.$6yb(new instantiationService_1.$6p(), new class extends extensions_1.$VF {
                activateByEvent(activationEvent) {
                    lastEvent = activationEvent;
                    return super.activateByEvent(activationEvent);
                }
            }, new log_1.$fj());
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
            const extensionService = new class extends extensions_1.$VF {
                activateByEvent(activationEvent) {
                    return Promise.reject(new Error('bad_activate'));
                }
            };
            const service = new commandService_1.$6yb(new instantiationService_1.$6p(), extensionService, new log_1.$fj());
            await extensionService.whenInstalledExtensionsRegistered();
            return service.executeCommand('foo').then(() => assert.ok(false), err => {
                assert.strictEqual(err.message, 'bad_activate');
            });
        });
        test('!onReady, but executeCommand', function () {
            let callCounter = 0;
            const reg = commands_1.$Gr.registerCommand('bar', () => callCounter += 1);
            const service = new commandService_1.$6yb(new instantiationService_1.$6p(), new class extends extensions_1.$VF {
                whenInstalledExtensionsRegistered() {
                    return new Promise(_resolve => { });
                }
            }, new log_1.$fj());
            service.executeCommand('bar');
            assert.strictEqual(callCounter, 1);
            reg.dispose();
        });
        test('issue #34913: !onReady, unknown command', function () {
            let callCounter = 0;
            let resolveFunc;
            const whenInstalledExtensionsRegistered = new Promise(_resolve => { resolveFunc = _resolve; });
            const service = new commandService_1.$6yb(new instantiationService_1.$6p(), new class extends extensions_1.$VF {
                whenInstalledExtensionsRegistered() {
                    return whenInstalledExtensionsRegistered;
                }
            }, new log_1.$fj());
            const r = service.executeCommand('bar');
            assert.strictEqual(callCounter, 0);
            const reg = commands_1.$Gr.registerCommand('bar', () => callCounter += 1);
            resolveFunc(true);
            return r.then(() => {
                reg.dispose();
                assert.strictEqual(callCounter, 1);
            });
        });
        test('Stop waiting for * extensions to activate when trigger is satisfied #62457', function () {
            let callCounter = 0;
            const disposable = new lifecycle_1.$jc();
            const events = [];
            const service = new commandService_1.$6yb(new instantiationService_1.$6p(), new class extends extensions_1.$VF {
                activateByEvent(event) {
                    events.push(event);
                    if (event === '*') {
                        return new Promise(() => { }); //forever promise...
                    }
                    if (event.indexOf('onCommand:') === 0) {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                const reg = commands_1.$Gr.registerCommand(event.substr('onCommand:'.length), () => {
                                    callCounter += 1;
                                });
                                disposable.add(reg);
                                resolve();
                            }, 0);
                        });
                    }
                    return Promise.resolve();
                }
            }, new log_1.$fj());
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
            const disposables = new lifecycle_1.$jc();
            const service = new commandService_1.$6yb(new instantiationService_1.$6p(), new class extends extensions_1.$VF {
                activateByEvent(event) {
                    if (event === '*') {
                        return new Promise(() => { }); //forever promise...
                    }
                    if (event.indexOf('onCommand:') === 0) {
                        return new Promise(resolve => {
                            setTimeout(() => {
                                // Register the command after some time
                                actualOrder.push('registering command');
                                const reg = commands_1.$Gr.registerCommand(event.substr('onCommand:'.length), () => {
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
            }, new log_1.$fj());
            return service.executeCommand('farboo2').then(() => {
                assert.deepStrictEqual(actualOrder, expectedOrder);
            }).finally(() => {
                disposables.dispose();
            });
        });
        test('issue #142155: execute commands synchronously if possible', async () => {
            const actualOrder = [];
            const disposables = new lifecycle_1.$jc();
            disposables.add(commands_1.$Gr.registerCommand(`bizBaz`, () => {
                actualOrder.push('executing command');
            }));
            const extensionService = new class extends extensions_1.$VF {
                activationEventIsDone(_activationEvent) {
                    return true;
                }
            };
            const service = new commandService_1.$6yb(new instantiationService_1.$6p(), extensionService, new log_1.$fj());
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
//# sourceMappingURL=commandService.test.js.map