/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadMessageService", "vs/platform/notification/common/notification", "vs/base/test/common/mock", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/dialogs/test/common/testDialogService"], function (require, exports, assert, mainThreadMessageService_1, notification_1, mock_1, lifecycle_1, event_1, testDialogService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const emptyCommandService = {
        _serviceBrand: undefined,
        onWillExecuteCommand: () => lifecycle_1.Disposable.None,
        onDidExecuteCommand: () => lifecycle_1.Disposable.None,
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
            return lifecycle_1.Disposable.None;
        }
    };
    class EmptyNotificationService {
        constructor(withNotify) {
            this.withNotify = withNotify;
            this.doNotDisturbMode = false;
            this.onDidAddNotification = event_1.Event.None;
            this.onDidRemoveNotification = event_1.Event.None;
            this.onDidChangeDoNotDisturbMode = event_1.Event.None;
        }
        notify(notification) {
            this.withNotify(notification);
            return new notification_1.NoOpNotification();
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
            return lifecycle_1.Disposable.None;
        }
    }
    suite('ExtHostMessageService', function () {
        test('propagte handle on select', async function () {
            const service = new mainThreadMessageService_1.MainThreadMessageService(null, new EmptyNotificationService(notification => {
                assert.strictEqual(notification.actions.primary.length, 1);
                queueMicrotask(() => notification.actions.primary[0].run());
            }), emptyCommandService, new testDialogService_1.TestDialogService());
            const handle = await service.$showMessage(1, 'h', {}, [{ handle: 42, title: 'a thing', isCloseAffordance: true }]);
            assert.strictEqual(handle, 42);
        });
        suite('modal', () => {
            test('calls dialog service', async () => {
                const service = new mainThreadMessageService_1.MainThreadMessageService(null, emptyNotificationService, emptyCommandService, new class extends (0, mock_1.mock)() {
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
                const service = new mainThreadMessageService_1.MainThreadMessageService(null, emptyNotificationService, emptyCommandService, new class extends (0, mock_1.mock)() {
                    prompt(prompt) {
                        return Promise.resolve({ result: prompt.cancelButton.run({ checkboxChecked: false }) });
                    }
                });
                const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: false }]);
                assert.strictEqual(handle, undefined);
            });
            test('hides Cancel button when not needed', async () => {
                const service = new mainThreadMessageService_1.MainThreadMessageService(null, emptyNotificationService, emptyCommandService, new class extends (0, mock_1.mock)() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE1lc3NhZ2VyU2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvZXh0SG9zdE1lc3NhZ2VyU2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBWWhHLE1BQU0sbUJBQW1CLEdBQW9CO1FBQzVDLGFBQWEsRUFBRSxTQUFTO1FBQ3hCLG9CQUFvQixFQUFFLEdBQUcsRUFBRSxDQUFDLHNCQUFVLENBQUMsSUFBSTtRQUMzQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxzQkFBVSxDQUFDLElBQUk7UUFDMUMsY0FBYyxFQUFFLENBQUMsU0FBaUIsRUFBRSxHQUFHLElBQVcsRUFBZ0IsRUFBRTtZQUNuRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQztLQUNELENBQUM7SUFFRixNQUFNLHdCQUF3QixHQUFHLElBQUk7UUFBQTtZQUVwQyxxQkFBZ0IsR0FBWSxLQUFLLENBQUM7WUFDbEMseUJBQW9CLEdBQXlCLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDeEQsNEJBQXVCLEdBQXlCLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDM0QsZ0NBQTJCLEdBQWdCLGFBQUssQ0FBQyxJQUFJLENBQUM7UUFtQnZELENBQUM7UUFsQkEsTUFBTSxDQUFDLEdBQUcsSUFBVztZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUNELElBQUksQ0FBQyxHQUFHLElBQVc7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFDRCxJQUFJLENBQUMsR0FBRyxJQUFXO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNwQyxD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