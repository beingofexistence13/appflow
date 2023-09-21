/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/notifications", "vs/base/common/actions", "vs/platform/notification/common/notification", "vs/base/common/errorMessage", "vs/workbench/services/notification/common/notificationService", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/async", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, notifications_1, actions_1, notification_1, errorMessage_1, notificationService_1, workbenchTestServices_1, async_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notifications', () => {
        const disposables = new lifecycle_1.DisposableStore();
        teardown(() => {
            disposables.clear();
        });
        test('Items', () => {
            // Invalid
            assert.ok(!notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: '' }));
            assert.ok(!notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: null }));
            // Duplicates
            const item1 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: 'Error Message' });
            const item2 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: 'Error Message' });
            const item3 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Info, message: 'Info Message' });
            const item4 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: 'Error Message', source: 'Source' });
            const item5 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: 'Error Message', actions: { primary: [disposables.add(new actions_1.Action('id', 'label'))] } });
            const item6 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: 'Error Message', actions: { primary: [disposables.add(new actions_1.Action('id', 'label'))] }, progress: { infinite: true } });
            assert.strictEqual(item1.equals(item1), true);
            assert.strictEqual(item2.equals(item2), true);
            assert.strictEqual(item3.equals(item3), true);
            assert.strictEqual(item4.equals(item4), true);
            assert.strictEqual(item5.equals(item5), true);
            assert.strictEqual(item1.equals(item2), true);
            assert.strictEqual(item1.equals(item3), false);
            assert.strictEqual(item1.equals(item4), false);
            assert.strictEqual(item1.equals(item5), false);
            const itemId1 = notifications_1.NotificationViewItem.create({ id: 'same', message: 'Info Message', severity: notification_1.Severity.Info });
            const itemId2 = notifications_1.NotificationViewItem.create({ id: 'same', message: 'Error Message', severity: notification_1.Severity.Error });
            assert.strictEqual(itemId1.equals(itemId2), true);
            assert.strictEqual(itemId1.equals(item3), false);
            // Progress
            assert.strictEqual(item1.hasProgress, false);
            assert.strictEqual(item6.hasProgress, true);
            // Message Box
            assert.strictEqual(item5.canCollapse, false);
            assert.strictEqual(item5.expanded, true);
            // Events
            let called = 0;
            disposables.add(item1.onDidChangeExpansion(() => {
                called++;
            }));
            item1.expand();
            item1.expand();
            item1.collapse();
            item1.collapse();
            assert.strictEqual(called, 2);
            called = 0;
            disposables.add(item1.onDidChangeContent(e => {
                if (e.kind === 3 /* NotificationViewItemContentChangeKind.PROGRESS */) {
                    called++;
                }
            }));
            item1.progress.infinite();
            item1.progress.done();
            assert.strictEqual(called, 2);
            called = 0;
            disposables.add(item1.onDidChangeContent(e => {
                if (e.kind === 1 /* NotificationViewItemContentChangeKind.MESSAGE */) {
                    called++;
                }
            }));
            item1.updateMessage('message update');
            called = 0;
            disposables.add(item1.onDidChangeContent(e => {
                if (e.kind === 0 /* NotificationViewItemContentChangeKind.SEVERITY */) {
                    called++;
                }
            }));
            item1.updateSeverity(notification_1.Severity.Error);
            called = 0;
            disposables.add(item1.onDidChangeContent(e => {
                if (e.kind === 2 /* NotificationViewItemContentChangeKind.ACTIONS */) {
                    called++;
                }
            }));
            item1.updateActions({ primary: [disposables.add(new actions_1.Action('id2', 'label'))] });
            assert.strictEqual(called, 1);
            called = 0;
            disposables.add(item1.onDidChangeVisibility(e => {
                called++;
            }));
            item1.updateVisibility(true);
            item1.updateVisibility(false);
            item1.updateVisibility(false);
            assert.strictEqual(called, 2);
            called = 0;
            disposables.add(item1.onDidClose(() => {
                called++;
            }));
            item1.close();
            assert.strictEqual(called, 1);
            // Error with Action
            const item7 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: (0, errorMessage_1.createErrorWithActions)('Hello Error', [disposables.add(new actions_1.Action('id', 'label'))]) });
            assert.strictEqual(item7.actions.primary.length, 1);
            // Filter
            const item8 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: 'Error Message' }, notification_1.NotificationsFilter.SILENT);
            assert.strictEqual(item8.priority, notification_1.NotificationPriority.SILENT);
            const item9 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: 'Error Message' }, notification_1.NotificationsFilter.OFF);
            assert.strictEqual(item9.priority, notification_1.NotificationPriority.DEFAULT);
            const item10 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: 'Error Message' }, notification_1.NotificationsFilter.ERROR);
            assert.strictEqual(item10.priority, notification_1.NotificationPriority.DEFAULT);
            const item11 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Warning, message: 'Error Message' }, notification_1.NotificationsFilter.ERROR);
            assert.strictEqual(item11.priority, notification_1.NotificationPriority.SILENT);
            for (const item of [item1, item2, item3, item4, item5, item6, itemId1, itemId2, item7, item8, item9, item10, item11]) {
                item.close();
            }
        });
        test('Items - does not fire changed when message did not change (content, severity)', async () => {
            const item1 = notifications_1.NotificationViewItem.create({ severity: notification_1.Severity.Error, message: 'Error Message' });
            let fired = false;
            disposables.add(item1.onDidChangeContent(() => {
                fired = true;
            }));
            item1.updateMessage('Error Message');
            await (0, async_1.timeout)(0);
            assert.ok(!fired, 'Expected onDidChangeContent to not be fired');
            item1.updateSeverity(notification_1.Severity.Error);
            await (0, async_1.timeout)(0);
            assert.ok(!fired, 'Expected onDidChangeContent to not be fired');
            for (const item of [item1]) {
                item.close();
            }
        });
        test('Model', () => {
            const model = disposables.add(new notifications_1.NotificationsModel());
            let lastNotificationEvent;
            disposables.add(model.onDidChangeNotification(e => {
                lastNotificationEvent = e;
            }));
            let lastStatusMessageEvent;
            disposables.add(model.onDidChangeStatusMessage(e => {
                lastStatusMessageEvent = e;
            }));
            const item1 = { severity: notification_1.Severity.Error, message: 'Error Message', actions: { primary: [disposables.add(new actions_1.Action('id', 'label'))] } };
            const item2 = { severity: notification_1.Severity.Warning, message: 'Warning Message', source: 'Some Source' };
            const item2Duplicate = { severity: notification_1.Severity.Warning, message: 'Warning Message', source: 'Some Source' };
            const item3 = { severity: notification_1.Severity.Info, message: 'Info Message' };
            const item1Handle = model.addNotification(item1);
            assert.strictEqual(lastNotificationEvent.item.severity, item1.severity);
            assert.strictEqual(lastNotificationEvent.item.message.linkedText.toString(), item1.message);
            assert.strictEqual(lastNotificationEvent.index, 0);
            assert.strictEqual(lastNotificationEvent.kind, 0 /* NotificationChangeType.ADD */);
            item1Handle.updateMessage('Different Error Message');
            assert.strictEqual(lastNotificationEvent.kind, 1 /* NotificationChangeType.CHANGE */);
            assert.strictEqual(lastNotificationEvent.detail, 1 /* NotificationViewItemContentChangeKind.MESSAGE */);
            item1Handle.updateSeverity(notification_1.Severity.Warning);
            assert.strictEqual(lastNotificationEvent.kind, 1 /* NotificationChangeType.CHANGE */);
            assert.strictEqual(lastNotificationEvent.detail, 0 /* NotificationViewItemContentChangeKind.SEVERITY */);
            item1Handle.updateActions({ primary: [], secondary: [] });
            assert.strictEqual(lastNotificationEvent.kind, 1 /* NotificationChangeType.CHANGE */);
            assert.strictEqual(lastNotificationEvent.detail, 2 /* NotificationViewItemContentChangeKind.ACTIONS */);
            item1Handle.progress.infinite();
            assert.strictEqual(lastNotificationEvent.kind, 1 /* NotificationChangeType.CHANGE */);
            assert.strictEqual(lastNotificationEvent.detail, 3 /* NotificationViewItemContentChangeKind.PROGRESS */);
            const item2Handle = model.addNotification(item2);
            assert.strictEqual(lastNotificationEvent.item.severity, item2.severity);
            assert.strictEqual(lastNotificationEvent.item.message.linkedText.toString(), item2.message);
            assert.strictEqual(lastNotificationEvent.index, 0);
            assert.strictEqual(lastNotificationEvent.kind, 0 /* NotificationChangeType.ADD */);
            const item3Handle = model.addNotification(item3);
            assert.strictEqual(lastNotificationEvent.item.severity, item3.severity);
            assert.strictEqual(lastNotificationEvent.item.message.linkedText.toString(), item3.message);
            assert.strictEqual(lastNotificationEvent.index, 0);
            assert.strictEqual(lastNotificationEvent.kind, 0 /* NotificationChangeType.ADD */);
            assert.strictEqual(model.notifications.length, 3);
            let called = 0;
            disposables.add(item1Handle.onDidClose(() => {
                called++;
            }));
            item1Handle.close();
            assert.strictEqual(called, 1);
            assert.strictEqual(model.notifications.length, 2);
            assert.strictEqual(lastNotificationEvent.item.severity, notification_1.Severity.Warning);
            assert.strictEqual(lastNotificationEvent.item.message.linkedText.toString(), 'Different Error Message');
            assert.strictEqual(lastNotificationEvent.index, 2);
            assert.strictEqual(lastNotificationEvent.kind, 3 /* NotificationChangeType.REMOVE */);
            const item2DuplicateHandle = model.addNotification(item2Duplicate);
            assert.strictEqual(model.notifications.length, 2);
            assert.strictEqual(lastNotificationEvent.item.severity, item2Duplicate.severity);
            assert.strictEqual(lastNotificationEvent.item.message.linkedText.toString(), item2Duplicate.message);
            assert.strictEqual(lastNotificationEvent.index, 0);
            assert.strictEqual(lastNotificationEvent.kind, 0 /* NotificationChangeType.ADD */);
            item2Handle.close();
            assert.strictEqual(model.notifications.length, 1);
            assert.strictEqual(lastNotificationEvent.item.severity, item2Duplicate.severity);
            assert.strictEqual(lastNotificationEvent.item.message.linkedText.toString(), item2Duplicate.message);
            assert.strictEqual(lastNotificationEvent.index, 0);
            assert.strictEqual(lastNotificationEvent.kind, 3 /* NotificationChangeType.REMOVE */);
            model.notifications[0].expand();
            assert.strictEqual(lastNotificationEvent.item.severity, item3.severity);
            assert.strictEqual(lastNotificationEvent.item.message.linkedText.toString(), item3.message);
            assert.strictEqual(lastNotificationEvent.index, 0);
            assert.strictEqual(lastNotificationEvent.kind, 2 /* NotificationChangeType.EXPAND_COLLAPSE */);
            const disposable = model.showStatusMessage('Hello World');
            assert.strictEqual(model.statusMessage.message, 'Hello World');
            assert.strictEqual(lastStatusMessageEvent.item.message, model.statusMessage.message);
            assert.strictEqual(lastStatusMessageEvent.kind, 0 /* StatusMessageChangeType.ADD */);
            disposable.dispose();
            assert.ok(!model.statusMessage);
            assert.strictEqual(lastStatusMessageEvent.kind, 1 /* StatusMessageChangeType.REMOVE */);
            const disposable2 = model.showStatusMessage('Hello World 2');
            const disposable3 = model.showStatusMessage('Hello World 3');
            assert.strictEqual(model.statusMessage.message, 'Hello World 3');
            disposable2.dispose();
            assert.strictEqual(model.statusMessage.message, 'Hello World 3');
            disposable3.dispose();
            assert.ok(!model.statusMessage);
            item2DuplicateHandle.close();
            item3Handle.close();
        });
        test('Service', async () => {
            const service = disposables.add(new notificationService_1.NotificationService(disposables.add(new workbenchTestServices_1.TestStorageService())));
            let addNotificationCount = 0;
            let notification;
            disposables.add(service.onDidAddNotification(n => {
                addNotificationCount++;
                notification = n;
            }));
            service.info('hello there');
            assert.strictEqual(addNotificationCount, 1);
            assert.strictEqual(notification.message, 'hello there');
            assert.strictEqual(notification.priority, notification_1.NotificationPriority.DEFAULT);
            assert.strictEqual(notification.source, undefined);
            service.model.notifications[0].close();
            let notificationHandle = service.notify({ message: 'important message', severity: notification_1.Severity.Warning });
            assert.strictEqual(addNotificationCount, 2);
            assert.strictEqual(notification.message, 'important message');
            assert.strictEqual(notification.severity, notification_1.Severity.Warning);
            let removeNotificationCount = 0;
            disposables.add(service.onDidRemoveNotification(n => {
                removeNotificationCount++;
                notification = n;
            }));
            notificationHandle.close();
            assert.strictEqual(removeNotificationCount, 1);
            assert.strictEqual(notification.message, 'important message');
            notificationHandle = service.notify({ priority: notification_1.NotificationPriority.SILENT, message: 'test', severity: notification_1.Severity.Ignore });
            assert.strictEqual(addNotificationCount, 3);
            assert.strictEqual(notification.message, 'test');
            assert.strictEqual(notification.priority, notification_1.NotificationPriority.SILENT);
            notificationHandle.close();
            assert.strictEqual(removeNotificationCount, 2);
            notificationHandle.close();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9ucy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3Rlc3QvY29tbW9uL25vdGlmaWNhdGlvbnMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWFoRyxLQUFLLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtRQUUzQixNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUUxQyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFFbEIsVUFBVTtZQUNWLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxvQ0FBb0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsdUJBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRixNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsb0NBQW9CLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLHVCQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdEYsYUFBYTtZQUNiLE1BQU0sS0FBSyxHQUFHLG9DQUFvQixDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSx1QkFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLENBQUUsQ0FBQztZQUNuRyxNQUFNLEtBQUssR0FBRyxvQ0FBb0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsdUJBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxDQUFFLENBQUM7WUFDbkcsTUFBTSxLQUFLLEdBQUcsb0NBQW9CLENBQUMs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