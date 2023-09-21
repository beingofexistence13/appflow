define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/severity", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/abstractKeybindingService", "vs/platform/keybinding/common/keybindingResolver", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/platform/keybinding/test/common/keybindingsTestUtils", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetryUtils"], function (require, exports, assert, keyCodes_1, keybindings_1, lifecycle_1, platform_1, severity_1, contextkey_1, abstractKeybindingService_1, keybindingResolver_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1, keybindingsTestUtils_1, log_1, notification_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createContext(ctx) {
        return {
            getValue: (key) => {
                return ctx[key];
            }
        };
    }
    suite('AbstractKeybindingService', () => {
        class TestKeybindingService extends abstractKeybindingService_1.$Ryb {
            constructor(resolver, contextKeyService, commandService, notificationService) {
                super(contextKeyService, commandService, telemetryUtils_1.$bo, notificationService, new log_1.$fj());
                this.r = resolver;
            }
            y() {
                return this.r;
            }
            z() {
                return true;
            }
            resolveKeybinding(kb) {
                return usLayoutResolvedKeybinding_1.$n3b.resolveKeybinding(kb, platform_1.OS);
            }
            resolveKeyboardEvent(keyboardEvent) {
                const chord = new keybindings_1.$yq(keyboardEvent.ctrlKey, keyboardEvent.shiftKey, keyboardEvent.altKey, keyboardEvent.metaKey, keyboardEvent.keyCode).toKeybinding();
                return this.resolveKeybinding(chord)[0];
            }
            resolveUserBinding(userBinding) {
                return [];
            }
            testDispatch(kb) {
                const keybinding = (0, keybindings_1.$xq)(kb, platform_1.OS);
                return this.I({
                    _standardKeyboardEventBrand: true,
                    ctrlKey: keybinding.ctrlKey,
                    shiftKey: keybinding.shiftKey,
                    altKey: keybinding.altKey,
                    metaKey: keybinding.metaKey,
                    altGraphKey: false,
                    keyCode: keybinding.keyCode,
                    code: null
                }, null);
            }
            _dumpDebugInfo() {
                return '';
            }
            _dumpDebugInfoJSON() {
                return '';
            }
            registerSchemaContribution() {
                // noop
            }
        }
        let createTestKeybindingService = null;
        let currentContextValue = null;
        let executeCommandCalls = null;
        let showMessageCalls = null;
        let statusMessageCalls = null;
        let statusMessageCallsDisposed = null;
        setup(() => {
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            createTestKeybindingService = (items) => {
                const contextKeyService = {
                    _serviceBrand: undefined,
                    onDidChangeContext: undefined,
                    bufferChangeEvents() { },
                    createKey: undefined,
                    contextMatchesRules: undefined,
                    getContextKeyValue: undefined,
                    createScoped: undefined,
                    createOverlay: undefined,
                    getContext: (target) => {
                        return currentContextValue;
                    },
                    updateParent: () => { }
                };
                const commandService = {
                    _serviceBrand: undefined,
                    onWillExecuteCommand: () => lifecycle_1.$kc.None,
                    onDidExecuteCommand: () => lifecycle_1.$kc.None,
                    executeCommand: (commandId, ...args) => {
                        executeCommandCalls.push({
                            commandId: commandId,
                            args: args
                        });
                        return Promise.resolve(undefined);
                    }
                };
                const notificationService = {
                    _serviceBrand: undefined,
                    doNotDisturbMode: false,
                    onDidAddNotification: undefined,
                    onDidRemoveNotification: undefined,
                    onDidChangeDoNotDisturbMode: undefined,
                    notify: (notification) => {
                        showMessageCalls.push({ sev: notification.severity, message: notification.message });
                        return new notification_1.$Zu();
                    },
                    info: (message) => {
                        showMessageCalls.push({ sev: severity_1.default.Info, message });
                        return new notification_1.$Zu();
                    },
                    warn: (message) => {
                        showMessageCalls.push({ sev: severity_1.default.Warning, message });
                        return new notification_1.$Zu();
                    },
                    error: (message) => {
                        showMessageCalls.push({ sev: severity_1.default.Error, message });
                        return new notification_1.$Zu();
                    },
                    prompt(severity, message, choices, options) {
                        throw new Error('not implemented');
                    },
                    status(message, options) {
                        statusMessageCalls.push(message);
                        return {
                            dispose: () => {
                                statusMessageCallsDisposed.push(message);
                            }
                        };
                    }
                };
                const resolver = new keybindingResolver_1.$1D(items, [], () => { });
                return new TestKeybindingService(resolver, contextKeyService, commandService, notificationService);
            };
        });
        teardown(() => {
            currentContextValue = null;
            executeCommandCalls = null;
            showMessageCalls = null;
            createTestKeybindingService = null;
            statusMessageCalls = null;
            statusMessageCallsDisposed = null;
        });
        function kbItem(keybinding, command, when) {
            return new resolvedKeybindingItem_1.$XD((0, keybindingsTestUtils_1.$A$b)(keybinding, platform_1.OS), command, null, when, true, null, false);
        }
        function toUsLabel(keybinding) {
            return (0, keybindingsTestUtils_1.$A$b)(keybinding, platform_1.OS).getLabel();
        }
        suite('simple tests: single- and multi-chord keybindings are dispatched', () => {
            test('a single-chord keybinding is dispatched correctly; this test makes sure the dispatch in general works before we test empty-string/null command ID', () => {
                const key = 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */;
                const kbService = createTestKeybindingService([
                    kbItem(key, 'myCommand'),
                ]);
                currentContextValue = createContext({});
                const shouldPreventDefault = kbService.testDispatch(key);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, ([{ commandId: "myCommand", args: [null] }]));
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, []);
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                kbService.dispose();
            });
            test('a multi-chord keybinding is dispatched correctly', () => {
                const chord0 = 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */;
                const chord1 = 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */;
                const key = [chord0, chord1];
                const kbService = createTestKeybindingService([
                    kbItem(key, 'myCommand'),
                ]);
                currentContextValue = createContext({});
                let shouldPreventDefault = kbService.testDispatch(chord0);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                shouldPreventDefault = kbService.testDispatch(chord1);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, ([{ commandId: "myCommand", args: [null] }]));
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                kbService.dispose();
            });
        });
        suite('keybindings with empty-string/null command ID', () => {
            test('a single-chord keybinding with an empty string command ID unbinds the keybinding (shouldPreventDefault = false)', () => {
                const kbService = createTestKeybindingService([
                    kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 'myCommand'),
                    kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, ''),
                ]);
                // send Ctrl/Cmd + K
                currentContextValue = createContext({});
                const shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
                assert.deepStrictEqual(shouldPreventDefault, false);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, []);
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                kbService.dispose();
            });
            test('a single-chord keybinding with a null command ID unbinds the keybinding (shouldPreventDefault = false)', () => {
                const kbService = createTestKeybindingService([
                    kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 'myCommand'),
                    kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, null),
                ]);
                // send Ctrl/Cmd + K
                currentContextValue = createContext({});
                const shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
                assert.deepStrictEqual(shouldPreventDefault, false);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, []);
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                kbService.dispose();
            });
            test('a multi-chord keybinding with an empty-string command ID keeps the keybinding (shouldPreventDefault = true)', () => {
                const chord0 = 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */;
                const chord1 = 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */;
                const key = [chord0, chord1];
                const kbService = createTestKeybindingService([
                    kbItem(key, 'myCommand'),
                    kbItem(key, ''),
                ]);
                currentContextValue = createContext({});
                let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`, `The key combination (${toUsLabel(chord0)}, ${toUsLabel(chord1)}) is not a command.`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                kbService.dispose();
            });
            test('a multi-chord keybinding with a null command ID keeps the keybinding (shouldPreventDefault = true)', () => {
                const chord0 = 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */;
                const chord1 = 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */;
                const key = [chord0, chord1];
                const kbService = createTestKeybindingService([
                    kbItem(key, 'myCommand'),
                    kbItem(key, null),
                ]);
                currentContextValue = createContext({});
                let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */);
                assert.deepStrictEqual(shouldPreventDefault, true);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`, `The key combination (${toUsLabel(chord0)}, ${toUsLabel(chord1)}) is not a command.`]));
                assert.deepStrictEqual(statusMessageCallsDisposed, ([`(${toUsLabel(chord0)}) was pressed. Waiting for second key of chord...`]));
                kbService.dispose();
            });
        });
        test('issue #16498: chord mode is quit for invalid chords', () => {
            const kbService = createTestKeybindingService([
                kbItem((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */), 'chordCommand'),
                kbItem(1 /* KeyCode.Backspace */, 'simpleCommand'),
            ]);
            // send Ctrl/Cmd + K
            let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, []);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, [
                `(${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}) was pressed. Waiting for second key of chord...`
            ]);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send backspace
            shouldPreventDefault = kbService.testDispatch(1 /* KeyCode.Backspace */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, []);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, [
                `The key combination (${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}, ${toUsLabel(1 /* KeyCode.Backspace */)}) is not a command.`
            ]);
            assert.deepStrictEqual(statusMessageCallsDisposed, [
                `(${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}) was pressed. Waiting for second key of chord...`
            ]);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send backspace
            shouldPreventDefault = kbService.testDispatch(1 /* KeyCode.Backspace */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
        test('issue #16833: Keybinding service should not testDispatch on modifier keys', () => {
            const kbService = createTestKeybindingService([
                kbItem(5 /* KeyCode.Ctrl */, 'nope'),
                kbItem(57 /* KeyCode.Meta */, 'nope'),
                kbItem(6 /* KeyCode.Alt */, 'nope'),
                kbItem(4 /* KeyCode.Shift */, 'nope'),
                kbItem(2048 /* KeyMod.CtrlCmd */, 'nope'),
                kbItem(256 /* KeyMod.WinCtrl */, 'nope'),
                kbItem(512 /* KeyMod.Alt */, 'nope'),
                kbItem(1024 /* KeyMod.Shift */, 'nope'),
            ]);
            function assertIsIgnored(keybinding) {
                const shouldPreventDefault = kbService.testDispatch(keybinding);
                assert.strictEqual(shouldPreventDefault, false);
                assert.deepStrictEqual(executeCommandCalls, []);
                assert.deepStrictEqual(showMessageCalls, []);
                assert.deepStrictEqual(statusMessageCalls, []);
                assert.deepStrictEqual(statusMessageCallsDisposed, []);
                executeCommandCalls = [];
                showMessageCalls = [];
                statusMessageCalls = [];
                statusMessageCallsDisposed = [];
            }
            assertIsIgnored(5 /* KeyCode.Ctrl */);
            assertIsIgnored(57 /* KeyCode.Meta */);
            assertIsIgnored(6 /* KeyCode.Alt */);
            assertIsIgnored(4 /* KeyCode.Shift */);
            assertIsIgnored(2048 /* KeyMod.CtrlCmd */);
            assertIsIgnored(256 /* KeyMod.WinCtrl */);
            assertIsIgnored(512 /* KeyMod.Alt */);
            assertIsIgnored(1024 /* KeyMod.Shift */);
            kbService.dispose();
        });
        test('can trigger command that is sharing keybinding with chord', () => {
            const kbService = createTestKeybindingService([
                kbItem((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */), 'chordCommand'),
                kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 'simpleCommand', contextkey_1.$Ii.has('key1')),
            ]);
            // send Ctrl/Cmd + K
            currentContextValue = createContext({
                key1: true
            });
            let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + K
            currentContextValue = createContext({});
            shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, []);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, [
                `(${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}) was pressed. Waiting for second key of chord...`
            ]);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + X
            currentContextValue = createContext({});
            shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'chordCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, [
                `(${toUsLabel(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)}) was pressed. Waiting for second key of chord...`
            ]);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
        test('cannot trigger chord if command is overwriting', () => {
            const kbService = createTestKeybindingService([
                kbItem((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */), 'chordCommand', contextkey_1.$Ii.has('key1')),
                kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 'simpleCommand'),
            ]);
            // send Ctrl/Cmd + K
            currentContextValue = createContext({});
            let shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + K
            currentContextValue = createContext({
                key1: true
            });
            shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, true);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            // send Ctrl/Cmd + X
            currentContextValue = createContext({
                key1: true
            });
            shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */);
            assert.strictEqual(shouldPreventDefault, false);
            assert.deepStrictEqual(executeCommandCalls, []);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
        test('can have spying command', () => {
            const kbService = createTestKeybindingService([
                kbItem(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, '^simpleCommand'),
            ]);
            // send Ctrl/Cmd + K
            currentContextValue = createContext({});
            const shouldPreventDefault = kbService.testDispatch(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */);
            assert.strictEqual(shouldPreventDefault, false);
            assert.deepStrictEqual(executeCommandCalls, [{
                    commandId: 'simpleCommand',
                    args: [null]
                }]);
            assert.deepStrictEqual(showMessageCalls, []);
            assert.deepStrictEqual(statusMessageCalls, []);
            assert.deepStrictEqual(statusMessageCallsDisposed, []);
            executeCommandCalls = [];
            showMessageCalls = [];
            statusMessageCalls = [];
            statusMessageCallsDisposed = [];
            kbService.dispose();
        });
    });
});
//# sourceMappingURL=abstractKeybindingService.test.js.map