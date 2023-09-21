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
define(["require", "exports", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/keyCodes", "vs/workbench/common/notifications", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/browser/parts/notifications/notificationsCommands", "vs/platform/list/browser/listService", "vs/platform/telemetry/common/telemetry", "vs/workbench/browser/parts/notifications/notificationsTelemetry", "vs/workbench/common/contextkeys", "vs/platform/notification/common/notification", "vs/platform/instantiation/common/instantiation", "vs/base/common/actions", "vs/base/common/hash", "vs/base/common/arrays"], function (require, exports, commands_1, contextkey_1, keybindingsRegistry_1, keyCodes_1, notifications_1, actions_1, nls_1, listService_1, telemetry_1, notificationsTelemetry_1, contextkeys_1, notification_1, instantiation_1, actions_2, hash_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bJb = exports.$aJb = exports.$_Ib = exports.$$Ib = exports.$0Ib = exports.$9Ib = exports.$8Ib = exports.$7Ib = exports.$6Ib = exports.$5Ib = exports.$4Ib = exports.$3Ib = void 0;
    // Center
    exports.$3Ib = 'notifications.showList';
    exports.$4Ib = 'notifications.hideList';
    const TOGGLE_NOTIFICATIONS_CENTER = 'notifications.toggleList';
    // Toasts
    exports.$5Ib = 'notifications.hideToasts';
    const FOCUS_NOTIFICATION_TOAST = 'notifications.focusToasts';
    const FOCUS_NEXT_NOTIFICATION_TOAST = 'notifications.focusNextToast';
    const FOCUS_PREVIOUS_NOTIFICATION_TOAST = 'notifications.focusPreviousToast';
    const FOCUS_FIRST_NOTIFICATION_TOAST = 'notifications.focusFirstToast';
    const FOCUS_LAST_NOTIFICATION_TOAST = 'notifications.focusLastToast';
    // Notification
    exports.$6Ib = 'notification.collapse';
    exports.$7Ib = 'notification.expand';
    exports.$8Ib = 'notification.acceptPrimaryAction';
    const TOGGLE_NOTIFICATION = 'notification.toggle';
    exports.$9Ib = 'notification.clear';
    exports.$0Ib = 'notifications.clearAll';
    exports.$$Ib = 'notifications.toggleDoNotDisturbMode';
    function $_Ib(listService, context) {
        if ((0, notifications_1.$Mzb)(context)) {
            return context;
        }
        const list = listService.lastFocusedList;
        if (list instanceof listService_1.$p4) {
            let element = list.getFocusedElements()[0];
            if (!(0, notifications_1.$Mzb)(element)) {
                if (list.isDOMFocused()) {
                    // the notification list might have received focus
                    // via keyboard and might not have a focussed element.
                    // in that case just return the first element
                    // https://github.com/microsoft/vscode/issues/191705
                    element = list.element(0);
                }
            }
            if ((0, notifications_1.$Mzb)(element)) {
                return element;
            }
        }
        return undefined;
    }
    exports.$_Ib = $_Ib;
    function $aJb(center, toasts, model) {
        // Show Notifications Cneter
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$3Ib,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.$wdb.negate(),
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */),
            handler: () => {
                toasts.hide();
                center.show();
            }
        });
        // Hide Notifications Center
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$4Ib,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
            when: contextkeys_1.$wdb,
            primary: 9 /* KeyCode.Escape */,
            handler: accessor => {
                const telemetryService = accessor.get(telemetry_1.$9k);
                for (const notification of model.notifications) {
                    if (notification.visible) {
                        telemetryService.publicLog2('notification:hide', (0, notificationsTelemetry_1.$1Ib)(notification.message.original, notification.sourceId, notification.priority === notification_1.NotificationPriority.SILENT));
                    }
                }
                center.hide();
            }
        });
        // Toggle Notifications Center
        commands_1.$Gr.registerCommand(TOGGLE_NOTIFICATIONS_CENTER, () => {
            if (center.isVisible) {
                center.hide();
            }
            else {
                toasts.hide();
                center.show();
            }
        });
        // Clear Notification
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$9Ib,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.$vdb,
            primary: 20 /* KeyCode.Delete */,
            mac: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
            },
            handler: (accessor, args) => {
                const notification = $_Ib(accessor.get(listService_1.$03), args);
                if (notification && !notification.hasProgress) {
                    notification.close();
                }
            }
        });
        // Expand Notification
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$7Ib,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.$vdb,
            primary: 17 /* KeyCode.RightArrow */,
            handler: (accessor, args) => {
                const notification = $_Ib(accessor.get(listService_1.$03), args);
                notification?.expand();
            }
        });
        // Accept Primary Action
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$8Ib,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.$Ii.and(contextkeys_1.$xdb),
            primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */,
            handler: (accessor) => {
                const actionRunner = accessor.get(instantiation_1.$Ah).createInstance($bJb);
                const notification = (0, arrays_1.$Mb)(model.notifications);
                if (!notification) {
                    return;
                }
                const primaryAction = notification.actions?.primary ? (0, arrays_1.$Mb)(notification.actions.primary) : undefined;
                if (!primaryAction) {
                    return;
                }
                actionRunner.run(primaryAction, notification);
                notification.close();
            }
        });
        // Collapse Notification
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: exports.$6Ib,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.$vdb,
            primary: 15 /* KeyCode.LeftArrow */,
            handler: (accessor, args) => {
                const notification = $_Ib(accessor.get(listService_1.$03), args);
                notification?.collapse();
            }
        });
        // Toggle Notification
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: TOGGLE_NOTIFICATION,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkeys_1.$vdb,
            primary: 10 /* KeyCode.Space */,
            secondary: [3 /* KeyCode.Enter */],
            handler: accessor => {
                const notification = $_Ib(accessor.get(listService_1.$03));
                notification?.toggle();
            }
        });
        // Hide Toasts
        commands_1.$Gr.registerCommand(exports.$5Ib, accessor => {
            const telemetryService = accessor.get(telemetry_1.$9k);
            for (const notification of model.notifications) {
                if (notification.visible) {
                    telemetryService.publicLog2('notification:hide', (0, notificationsTelemetry_1.$1Ib)(notification.message.original, notification.sourceId, notification.priority === notification_1.NotificationPriority.SILENT));
                }
            }
            toasts.hide();
        });
        keybindingsRegistry_1.$Nu.registerKeybindingRule({
            id: exports.$5Ib,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ - 50,
            when: contextkeys_1.$xdb,
            primary: 9 /* KeyCode.Escape */
        });
        keybindingsRegistry_1.$Nu.registerKeybindingRule({
            id: exports.$5Ib,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 100,
            when: contextkey_1.$Ii.and(contextkeys_1.$xdb, contextkeys_1.$vdb),
            primary: 9 /* KeyCode.Escape */
        });
        // Focus Toasts
        commands_1.$Gr.registerCommand(FOCUS_NOTIFICATION_TOAST, () => toasts.focus());
        // Focus Next Toast
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: FOCUS_NEXT_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.$Ii.and(contextkeys_1.$vdb, contextkeys_1.$xdb),
            primary: 18 /* KeyCode.DownArrow */,
            handler: () => {
                toasts.focusNext();
            }
        });
        // Focus Previous Toast
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: FOCUS_PREVIOUS_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.$Ii.and(contextkeys_1.$vdb, contextkeys_1.$xdb),
            primary: 16 /* KeyCode.UpArrow */,
            handler: () => {
                toasts.focusPrevious();
            }
        });
        // Focus First Toast
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: FOCUS_FIRST_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.$Ii.and(contextkeys_1.$vdb, contextkeys_1.$xdb),
            primary: 11 /* KeyCode.PageUp */,
            secondary: [14 /* KeyCode.Home */],
            handler: () => {
                toasts.focusFirst();
            }
        });
        // Focus Last Toast
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: FOCUS_LAST_NOTIFICATION_TOAST,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.$Ii.and(contextkeys_1.$vdb, contextkeys_1.$xdb),
            primary: 12 /* KeyCode.PageDown */,
            secondary: [13 /* KeyCode.End */],
            handler: () => {
                toasts.focusLast();
            }
        });
        // Clear All Notifications
        commands_1.$Gr.registerCommand(exports.$0Ib, () => center.clearAll());
        // Toggle Do Not Disturb Mode
        commands_1.$Gr.registerCommand(exports.$$Ib, accessor => {
            const notificationService = accessor.get(notification_1.$Yu);
            notificationService.doNotDisturbMode = !notificationService.doNotDisturbMode;
        });
        // Commands for Command Palette
        const category = { value: (0, nls_1.localize)(0, null), original: 'Notifications' };
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: exports.$3Ib, title: { value: (0, nls_1.localize)(1, null), original: 'Show Notifications' }, category } });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: exports.$4Ib, title: { value: (0, nls_1.localize)(2, null), original: 'Hide Notifications' }, category }, when: contextkeys_1.$wdb });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: exports.$0Ib, title: { value: (0, nls_1.localize)(3, null), original: 'Clear All Notifications' }, category } });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: exports.$8Ib, title: { value: (0, nls_1.localize)(4, null), original: 'Accept Notification Primary Action' }, category } });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: exports.$$Ib, title: { value: (0, nls_1.localize)(5, null), original: 'Toggle Do Not Disturb Mode' }, category } });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, { command: { id: FOCUS_NOTIFICATION_TOAST, title: { value: (0, nls_1.localize)(6, null), original: 'Focus Notification Toast' }, category }, when: contextkeys_1.$xdb });
    }
    exports.$aJb = $aJb;
    let $bJb = class $bJb extends actions_2.$hi {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        async u(action, context) {
            this.a.publicLog2('workbenchActionExecuted', { id: action.id, from: 'message' });
            if ((0, notifications_1.$Mzb)(context)) {
                // Log some additional telemetry specifically for actions
                // that are triggered from within notifications.
                this.a.publicLog2('notification:actionExecuted', {
                    id: (0, hash_1.$pi)(context.message.original.toString()).toString(),
                    actionLabel: action.label,
                    source: context.sourceId || 'core',
                    silent: context.priority === notification_1.NotificationPriority.SILENT
                });
            }
            // Run and make sure to notify on any error again
            try {
                await super.u(action, context);
            }
            catch (error) {
                this.b.error(error);
            }
        }
    };
    exports.$bJb = $bJb;
    exports.$bJb = $bJb = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, notification_1.$Yu)
    ], $bJb);
});
//# sourceMappingURL=notificationsCommands.js.map