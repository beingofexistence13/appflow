/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadMessageService", "vs/platform/notification/common/notification", "vs/base/test/common/mock", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/dialogs/test/common/testDialogService"], function (require, exports, assert, mainThreadMessageService_1, notification_1, mock_1, lifecycle_1, event_1, testDialogService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const emptyCommandService = {
        _serviceBrand: undefined,
        onWillExecuteCommand: () => lifecycle_1.$kc.None,
        onDidExecuteCommand: () => lifecycle_1.$kc.None,
        executeCommand: (commandId, ...args) => {
            return Promise.resolve(undefined);
        }
    };
    const emptyNotificationService = new class {
        constructor() {
            this.doNotDisturbMode = false;
            this.onDidAddNotification = event_1.Event.None;
            this.onDidRemoveNotification = event_1.Event.None;
            this.onDidChangeDoNotDisturbMode = event_1.Event.None;
        }
        notify(...args) {
            throw new Error('not implemented');
        }
        info(...args) {
            throw new Error('not implemented');
        }
        warn(...args) {
            throw new Error('not implemented');
        }
        error(...args) {
            throw new Error('not implemented');
        }
        prompt(severity, message, choices, options) {
            throw new Error('not implemented');
        }
        status(message, options) {
            return lifecycle_1.$kc.None;
        }
    };
    class EmptyNotificationService {
        constructor(a) {
            this.a = a;
            this.doNotDisturbMode = false;
            this.onDidAddNotification = event_1.Event.None;
            this.onDidRemoveNotification = event_1.Event.None;
            this.onDidChangeDoNotDisturbMode = event_1.Event.None;
        }
        notify(notification) {
            this.a(notification);
            return new notification_1.$Zu();
        }
        info(message) {
            throw new Error('Method not implemented.');
        }
        warn(message) {
            throw new Error('Method not implemented.');
        }
        error(message) {
            throw new Error('Method not implemented.');
        }
        prompt(severity, message, choices, options) {
            throw new Error('Method not implemented');
        }
        status(message, options) {
            return lifecycle_1.$kc.None;
        }
    }
    suite('ExtHostMessageService', function () {
        test('propagte handle on select', async function () {
            const service = new mainThreadMessageService_1.$ykb(null, new EmptyNotificationService(notification => {
                assert.strictEqual(notification.actions.primary.length, 1);
                queueMicrotask(() => notification.actions.primary[0].run());
            }), emptyCommandService, new testDialogService_1.$H0b());
            const handle = await service.$showMessage(1, 'h', {}, [{ handle: 42, title: 'a thing', isCloseAffordance: true }]);
            assert.strictEqual(handle, 42);
        });
        suite('modal', () => {
            test('calls dialog service', async () => {
                const service = new mainThreadMessageService_1.$ykb(null, emptyNotificationService, emptyCommandService, new class extends (0, mock_1.$rT)() {
                    prompt({ type, message, buttons, cancelButton }) {
                        assert.strictEqual(type, 1);
                        assert.strictEqual(message, 'h');
                        assert.strictEqual(buttons.length, 1);
                        assert.strictEqual(cancelButton.label, 'Cancel');
                        return Promise.resolve({ result: buttons[0].run({ checkboxChecked: false }) });
                    }
                });
                const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: false }]);
                assert.strictEqual(handle, 42);
            });
            test('returns undefined when cancelled', async () => {
                const service = new mainThreadMessageService_1.$ykb(null, emptyNotificationService, emptyCommandService, new class extends (0, mock_1.$rT)() {
                    prompt(prompt) {
                        return Promise.resolve({ result: prompt.cancelButton.run({ checkboxChecked: false }) });
                    }
                });
                const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: false }]);
                assert.strictEqual(handle, undefined);
            });
            test('hides Cancel button when not needed', async () => {
                const service = new mainThreadMessageService_1.$ykb(null, emptyNotificationService, emptyCommandService, new class extends (0, mock_1.$rT)() {
                    prompt({ type, message, buttons, cancelButton }) {
                        assert.strictEqual(buttons.length, 0);
                        assert.ok(cancelButton);
                        return Promise.resolve({ result: cancelButton.run({ checkboxChecked: false }) });
                    }
                });
                const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: true }]);
                assert.strictEqual(handle, 42);
            });
        });
    });
});
//# sourceMappingURL=extHostMessagerService.test.js.map