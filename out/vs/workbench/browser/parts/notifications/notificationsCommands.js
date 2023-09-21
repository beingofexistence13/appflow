/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/keyCodes", "vs/workbench/common/notifications", "vs/platform/actions/common/actions", "vs/nls", "vs/platform/list/browser/listService", "vs/platform/telemetry/common/telemetry", "vs/workbench/browser/parts/notifications/notificationsTelemetry", "vs/workbench/common/contextkeys", "vs/platform/notification/common/notification", "vs/platform/instantiation/common/instantiation", "vs/base/common/actions", "vs/base/common/hash", "vs/base/common/arrays"], function (require, exports, commands_1, contextkey_1, keybindingsRegistry_1, keyCodes_1, notifications_1, actions_1, nls_1, listService_1, telemetry_1, notificationsTelemetry_1, contextkeys_1, notification_1, instantiation_1, actions_2, hash_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationActionRunner = exports.registerNotificationCommands = exports.getNotificationFromContext = exports.TOGGLE_DO_NOT_DISTURB_MODE = exports.CLEAR_ALL_NOTIFICATIONS = exports.CLEAR_NOTIFICATION = exports.ACCEPT_PRIMARY_ACTION_NOTIFICATION = exports.EXPAND_NOTIFICATION = exports.COLLAPSE_NOTIFICATION = exports.HIDE_NOTIFICATION_TOAST = exports.HIDE_NOTIFICATIONS_CENTER = exports.SHOW_NOTIFICATIONS_CENTER = void 0;
    // Center
    exports.SHOW_NOTIFICATIONS_CENTER = 'notifications.showList';
    exports.HIDE_NOTIFICATIONS_CENTER = 'notifications.hideList';
    const TOGGLE_NOTIFICATIONS_CENTER = 'notifications.toggleList';
    // Toasts
    exports.HIDE_NOTIFICATION_TOAST = 'notifications.hideToasts';
    const FOCUS_NOTIFICATION_TOAST = 'notifications.focusToasts';
    const FOCUS_NEXT_NOTIFICATION_TOAST = 'notifications.focusNextToast';
    const FOCUS_PREVIOUS_NOTIFICATION_TOAST = 'notifications.focusPreviousToast';
    const FOCUS_FIRST_NOTIFICATION_TOAST = 'notifications.focusFirstToast';
    const FOCUS_LAST_NOTIFICATION_TOAST = 'notifications.focusLastToast';
    // Notification
    exports.COLLAPSE_NOTIFICATION = 'notification.collapse';
    exports.EXPAND_NOTIFICATION = 'notification.expand';
    exports.ACCEPT_PRIMARY_ACTION_NOTIFICATION = 'notification.acceptPrimaryAction';
    const TOGGLE_NOTIFICATION = 'notification.toggle';
    exports.CLEAR_NOTIFICATION = 'notification.clear';
    exports.CLEAR_ALL_NOTIFICATIONS = 'notifications.clearAll';
    exports.TOGGLE_DO_NOT_DISTURB_MODE = 'notifications.toggleDoNotDisturbMode';
    function getNotificationFromContext(listService, context) {
        if ((0, notifications_1.isNotificationViewItem)(context)) {
            return context;
        }
        const list = listService.lastFocusedList;
        if (list instanceof listService_1.WorkbenchList) {
            let element = list.getFocusedElements()[0];
            if (!(0, notifications_1.isNotificationViewItem)(element)) {
                if (list.isDOMFocused()) {
                    // the notification list might have received focus
                    // via keyboard and might not have a focussed element.
                    // in that case just return the first element
                    // https://github.com/microsoft/vscode/issues/191705
                    element = list.element(0);
                }
            }
            if ((0, notifications_1.isNotificationViewItem)(element)) {
                return element;
            }
        }
        return undefined;
    }
    exports.getNotificationFromContext = getNotificationFromContext;
    function registerNotificationCommands(center, toasts, model) {
        // Show Notifications Cneter
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.SHOW_NOTIFICATIONS_CENTER,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.NotificationsCenterVisibleContext.negate(),
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */),
            handler: () => {
                toasts.hide();
                center.show();
            }
        });
        // Hide Notifications Center
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.HIDE_NOTIFICATIONS_CENTER,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
            when: contextkeys_1.NotificationsCenterVisibleContext,
            primary: 9 /* KeyCode.Escape */,
            handler: accessor => {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                for (const notification of model.notifications) {
                    if (notification.visible) {
                        telemetryService.publicLog2('notification:hide', (0, notificationsTelemetry_1.notificationToMetrics)(notification.message.original, notification.sourceId, notification.priority === notification_1.NotificationPriority.SILENT));
                    }
                }
                center.hide();
            }
        });
        // Toggle Notifications Center
        commands_1.CommandsRegistry.registerCommand(TOGGLE_NOTIFICATIONS_CENTER, () => {
            if (center.isVisible) {
                center.hide();
            }
            else {
                toasts.hide();
                center.show();
            }
        });
        // Clear Notification
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLEAR_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.NotificationFocusedContext,
            primary: 20 /* KeyCode.Delete */,
            mac: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
            },
            handler: (accessor, args) => {
                const notification = getNotificationFromContext(accessor.get(listService_1.IListService), args);
                if (notification && !notification.hasProgress) {
                    notification.close();
                }
            }
        });
        // Expand Notification
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.EXPAND_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.NotificationFocusedContext,
            primary: 17 /* KeyCode.RightArrow */,
            handler: (accessor, args) => {
                const notification = getNotificationFromContext(accessor.get(listService_1.IListService), args);
                notification?.expand();
            }
        });
        // Accept Primary Action
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.ACCEPT_PRIMARY_ACTION_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationsToastsVisibleContext),
            primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */,
            handler: (accessor) => {
                const actionRunner = accessor.get(instantiation_1.IInstantiationService).createInstance(NotificationActionRunner);
                const notification = (0, arrays_1.firstOrDefault)(model.notifications);
                if (!notification) {
                    return;
                }
                const primaryAction = notification.actions?.primary ? (0, arrays_1.firstOrDefault)(notification.actions.primary) : undefined;
                if (!primaryAction) {
                    return;
                }
                actionRunner.run(primaryAction, notification);
                notification.close();
            }
        });
        // Collapse Notification
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.COLLAPSE_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.NotificationFocusedContext,
            primary: 15 /* KeyCode.LeftArrow */,
            handler: (accessor, args) => {
                const notification = getNotificationFromContext(accessor.get(listService_1.IListService), args);
                notification?.collapse();
            }
        });
        // Toggle Notification
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: TOGGLE_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.NotificationFocusedContext,
            primary: 10 /* KeyCode.Space */,
            secondary: [3 /* KeyCode.Enter */],
            handler: accessor => {
                const notification = getNotificationFromContext(accessor.get(listService_1.IListService));
                notification?.toggle();
            }
        });
        // Hide Toasts
        commands_1.CommandsRegistry.registerCommand(exports.HIDE_NOTIFICATION_TOAST, accessor => {
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            for (const notification of model.notifications) {
                if (notification.visible) {
                    telemetryService.publicLog2('notification:hide', (0, notificationsTelemetry_1.notificationToMetrics)(notification.message.original, notification.sourceId, notification.priority === notification_1.NotificationPriority.SILENT));
                }
            }
            toasts.hide();
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
            id: exports.HIDE_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ - 50,
            when: contextkeys_1.NotificationsToastsVisibleContext,
            primary: 9 /* KeyCode.Escape */
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
            id: exports.HIDE_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationsToastsVisibleContext, contextkeys_1.NotificationFocusedContext),
            primary: 9 /* KeyCode.Escape */
        });
        // Focus Toasts
        commands_1.CommandsRegistry.registerCommand(FOCUS_NOTIFICATION_TOAST, () => toasts.focus());
        // Focus Next Toast
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: FOCUS_NEXT_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationFocusedContext, contextkeys_1.NotificationsToastsVisibleContext),
            primary: 18 /* KeyCode.DownArrow */,
            handler: () => {
                toasts.focusNext();
            }
        });
        // Focus Previous Toast
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: FOCUS_PREVIOUS_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationFocusedContext, contextkeys_1.NotificationsToastsVisibleContext),
            primary: 16 /* KeyCode.UpArrow */,
            handler: () => {
                toasts.focusPrevious();
            }
        });
        // Focus First Toast
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: FOCUS_FIRST_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationFocusedContext, contextkeys_1.NotificationsToastsVisibleContext),
            primary: 11 /* KeyCode.PageUp */,
            secondary: [14 /* KeyCode.Home */],
            handler: () => {
                toasts.focusFirst();
            }
        });
        // Focus Last Toast
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: FOCUS_LAST_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(contextkeys_1.NotificationFocusedContext, contextkeys_1.NotificationsToastsVisibleContext),
            primary: 12 /* KeyCode.PageDown */,
            secondary: [13 /* KeyCode.End */],
            handler: () => {
                toasts.focusLast();
            }
        });
        // Clear All Notifications
        commands_1.CommandsRegistry.registerCommand(exports.CLEAR_ALL_NOTIFICATIONS, () => center.clearAll());
        // Toggle Do Not Disturb Mode
        commands_1.CommandsRegistry.registerCommand(exports.TOGGLE_DO_NOT_DISTURB_MODE, accessor => {
            const notificationService = accessor.get(notification_1.INotificationService);
            notificationService.doNotDisturbMode = !notificationService.doNotDisturbMode;
        });
        // Commands for Command Palette
        const category = { value: (0, nls_1.localize)('notifications', "Notifications"), original: 'Notifications' };
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.SHOW_NOTIFICATIONS_CENTER, title: { value: (0, nls_1.localize)('showNotifications', "Show Notifications"), original: 'Show Notifications' }, category } });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.HIDE_NOTIFICATIONS_CENTER, title: { value: (0, nls_1.localize)('hideNotifications', "Hide Notifications"), original: 'Hide Notifications' }, category }, when: contextkeys_1.NotificationsCenterVisibleContext });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.CLEAR_ALL_NOTIFICATIONS, title: { value: (0, nls_1.localize)('clearAllNotifications', "Clear All Notifications"), original: 'Clear All Notifications' }, category } });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.ACCEPT_PRIMARY_ACTION_NOTIFICATION, title: { value: (0, nls_1.localize)('acceptNotificationPrimaryAction', "Accept Notification Primary Action"), original: 'Accept Notification Primary Action' }, category } });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: exports.TOGGLE_DO_NOT_DISTURB_MODE, title: { value: (0, nls_1.localize)('toggleDoNotDisturbMode', "Toggle Do Not Disturb Mode"), original: 'Toggle Do Not Disturb Mode' }, category } });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command: { id: FOCUS_NOTIFICATION_TOAST, title: { value: (0, nls_1.localize)('focusNotificationToasts', "Focus Notification Toast"), original: 'Focus Notification Toast' }, category }, when: contextkeys_1.NotificationsToastsVisibleContext });
    }
    exports.registerNotificationCommands = registerNotificationCommands;
    let NotificationActionRunner = class NotificationActionRunner extends actions_2.ActionRunner {
        constructor(telemetryService, notificationService) {
            super();
            this.telemetryService = telemetryService;
            this.notificationService = notificationService;
        }
        async runAction(action, context) {
            this.telemetryService.publicLog2('workbenchActionExecuted', { id: action.id, from: 'message' });
            if ((0, notifications_1.isNotificationViewItem)(context)) {
                // Log some additional telemetry specifically for actions
                // that are triggered from within notifications.
                this.telemetryService.publicLog2('notification:actionExecuted', {
                    id: (0, hash_1.hash)(context.message.original.toString()).toString(),
                    actionLabel: action.label,
                    source: context.sourceId || 'core',
                    silent: context.priority === notification_1.NotificationPriority.SILENT
                });
            }
            // Run and make sure to notify on any error again
            try {
                await super.runAction(action, context);
            }
            catch (error) {
                this.notificationService.error(error);
            }
        }
    };
    exports.NotificationActionRunner = NotificationActionRunner;
    exports.NotificationActionRunner = NotificationActionRunner = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, notification_1.INotificationService)
    ], NotificationActionRunner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc0NvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvbm90aWZpY2F0aW9ucy9ub3RpZmljYXRpb25zQ29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBbUJoRyxTQUFTO0lBQ0ksUUFBQSx5QkFBeUIsR0FBRyx3QkFBd0IsQ0FBQztJQUNyRCxRQUFBLHlCQUF5QixHQUFHLHdCQUF3QixDQUFDO0lBQ2xFLE1BQU0sMkJBQTJCLEdBQUcsMEJBQTBCLENBQUM7SUFFL0QsU0FBUztJQUNJLFFBQUEsdUJBQXVCLEdBQUcsMEJBQTBCLENBQUM7SUFDbEUsTUFBTSx3QkFBd0IsR0FBRywyQkFBMkIsQ0FBQztJQUM3RCxNQUFNLDZCQUE2QixHQUFHLDhCQUE4QixDQUFDO0lBQ3JFLE1BQU0saUNBQWlDLEdBQUcsa0NBQWtDLENBQUM7SUFDN0UsTUFBTSw4QkFBOEIsR0FBRywrQkFBK0IsQ0FBQztJQUN2RSxNQUFNLDZCQUE2QixHQUFHLDhCQUE4QixDQUFDO0lBRXJFLGVBQWU7SUFDRixRQUFBLHFCQUFxQixHQUFHLHVCQUF1QixDQUFDO0lBQ2hELFFBQUEsbUJBQW1CLEdBQUcscUJBQXFCLENBQUM7SUFDNUMsUUFBQSxrQ0FBa0MsR0FBRyxrQ0FBa0MsQ0FBQztJQUNyRixNQUFNLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0lBQ3JDLFFBQUEsa0JBQWtCLEdBQUcsb0JBQW9CLENBQUM7SUFDMUMsUUFBQSx1QkFBdUIsR0FBRyx3QkFBd0IsQ0FBQztJQUNuRCxRQUFBLDBCQUEwQixHQUFHLHNDQUFzQyxDQUFDO0lBcUJqRixTQUFnQiwwQkFBMEIsQ0FBQyxXQUF5QixFQUFFLE9BQWlCO1FBQ3RGLElBQUksSUFBQSxzQ0FBc0IsRUFBQyxPQUFPLENBQUMsRUFBRTtZ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