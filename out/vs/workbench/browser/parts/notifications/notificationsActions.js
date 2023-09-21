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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/platform/commands/common/commands", "vs/platform/clipboard/common/clipboardService", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/base/common/themables", "vs/css!./media/notificationsActions"], function (require, exports, nls_1, actions_1, notificationsCommands_1, commands_1, clipboardService_1, codicons_1, iconRegistry_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CopyNotificationMessageAction = exports.ConfigureNotificationAction = exports.CollapseNotificationAction = exports.ExpandNotificationAction = exports.HideNotificationsCenterAction = exports.ToggleDoNotDisturbAction = exports.ClearAllNotificationsAction = exports.ClearNotificationAction = void 0;
    const clearIcon = (0, iconRegistry_1.registerIcon)('notifications-clear', codicons_1.Codicon.close, (0, nls_1.localize)('clearIcon', 'Icon for the clear action in notifications.'));
    const clearAllIcon = (0, iconRegistry_1.registerIcon)('notifications-clear-all', codicons_1.Codicon.clearAll, (0, nls_1.localize)('clearAllIcon', 'Icon for the clear all action in notifications.'));
    const hideIcon = (0, iconRegistry_1.registerIcon)('notifications-hide', codicons_1.Codicon.chevronDown, (0, nls_1.localize)('hideIcon', 'Icon for the hide action in notifications.'));
    const expandIcon = (0, iconRegistry_1.registerIcon)('notifications-expand', codicons_1.Codicon.chevronUp, (0, nls_1.localize)('expandIcon', 'Icon for the expand action in notifications.'));
    const collapseIcon = (0, iconRegistry_1.registerIcon)('notifications-collapse', codicons_1.Codicon.chevronDown, (0, nls_1.localize)('collapseIcon', 'Icon for the collapse action in notifications.'));
    const configureIcon = (0, iconRegistry_1.registerIcon)('notifications-configure', codicons_1.Codicon.gear, (0, nls_1.localize)('configureIcon', 'Icon for the configure action in notifications.'));
    const doNotDisturbIcon = (0, iconRegistry_1.registerIcon)('notifications-do-not-disturb', codicons_1.Codicon.bellSlash, (0, nls_1.localize)('doNotDisturbIcon', 'Icon for the mute all action in notifications.'));
    let ClearNotificationAction = class ClearNotificationAction extends actions_1.Action {
        static { this.ID = notificationsCommands_1.CLEAR_NOTIFICATION; }
        static { this.LABEL = (0, nls_1.localize)('clearNotification', "Clear Notification"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(clearIcon));
            this.commandService = commandService;
        }
        async run(notification) {
            this.commandService.executeCommand(notificationsCommands_1.CLEAR_NOTIFICATION, notification);
        }
    };
    exports.ClearNotificationAction = ClearNotificationAction;
    exports.ClearNotificationAction = ClearNotificationAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], ClearNotificationAction);
    let ClearAllNotificationsAction = class ClearAllNotificationsAction extends actions_1.Action {
        static { this.ID = notificationsCommands_1.CLEAR_ALL_NOTIFICATIONS; }
        static { this.LABEL = (0, nls_1.localize)('clearNotifications', "Clear All Notifications"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(clearAllIcon));
            this.commandService = commandService;
        }
        async run() {
            this.commandService.executeCommand(notificationsCommands_1.CLEAR_ALL_NOTIFICATIONS);
        }
    };
    exports.ClearAllNotificationsAction = ClearAllNotificationsAction;
    exports.ClearAllNotificationsAction = ClearAllNotificationsAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], ClearAllNotificationsAction);
    let ToggleDoNotDisturbAction = class ToggleDoNotDisturbAction extends actions_1.Action {
        static { this.ID = notificationsCommands_1.TOGGLE_DO_NOT_DISTURB_MODE; }
        static { this.LABEL = (0, nls_1.localize)('toggleDoNotDisturbMode', "Toggle Do Not Disturb Mode"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(doNotDisturbIcon));
            this.commandService = commandService;
        }
        async run() {
            this.commandService.executeCommand(notificationsCommands_1.TOGGLE_DO_NOT_DISTURB_MODE);
        }
    };
    exports.ToggleDoNotDisturbAction = ToggleDoNotDisturbAction;
    exports.ToggleDoNotDisturbAction = ToggleDoNotDisturbAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], ToggleDoNotDisturbAction);
    let HideNotificationsCenterAction = class HideNotificationsCenterAction extends actions_1.Action {
        static { this.ID = notificationsCommands_1.HIDE_NOTIFICATIONS_CENTER; }
        static { this.LABEL = (0, nls_1.localize)('hideNotificationsCenter', "Hide Notifications"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(hideIcon));
            this.commandService = commandService;
        }
        async run() {
            this.commandService.executeCommand(notificationsCommands_1.HIDE_NOTIFICATIONS_CENTER);
        }
    };
    exports.HideNotificationsCenterAction = HideNotificationsCenterAction;
    exports.HideNotificationsCenterAction = HideNotificationsCenterAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], HideNotificationsCenterAction);
    let ExpandNotificationAction = class ExpandNotificationAction extends actions_1.Action {
        static { this.ID = notificationsCommands_1.EXPAND_NOTIFICATION; }
        static { this.LABEL = (0, nls_1.localize)('expandNotification', "Expand Notification"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(expandIcon));
            this.commandService = commandService;
        }
        async run(notification) {
            this.commandService.executeCommand(notificationsCommands_1.EXPAND_NOTIFICATION, notification);
        }
    };
    exports.ExpandNotificationAction = ExpandNotificationAction;
    exports.ExpandNotificationAction = ExpandNotificationAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], ExpandNotificationAction);
    let CollapseNotificationAction = class CollapseNotificationAction extends actions_1.Action {
        static { this.ID = notificationsCommands_1.COLLAPSE_NOTIFICATION; }
        static { this.LABEL = (0, nls_1.localize)('collapseNotification', "Collapse Notification"); }
        constructor(id, label, commandService) {
            super(id, label, themables_1.ThemeIcon.asClassName(collapseIcon));
            this.commandService = commandService;
        }
        async run(notification) {
            this.commandService.executeCommand(notificationsCommands_1.COLLAPSE_NOTIFICATION, notification);
        }
    };
    exports.CollapseNotificationAction = CollapseNotificationAction;
    exports.CollapseNotificationAction = CollapseNotificationAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], CollapseNotificationAction);
    class ConfigureNotificationAction extends actions_1.Action {
        static { this.ID = 'workbench.action.configureNotification'; }
        static { this.LABEL = (0, nls_1.localize)('configureNotification', "More Actions..."); }
        constructor(id, label, configurationActions) {
            super(id, label, themables_1.ThemeIcon.asClassName(configureIcon));
            this.configurationActions = configurationActions;
        }
    }
    exports.ConfigureNotificationAction = ConfigureNotificationAction;
    let CopyNotificationMessageAction = class CopyNotificationMessageAction extends actions_1.Action {
        static { this.ID = 'workbench.action.copyNotificationMessage'; }
        static { this.LABEL = (0, nls_1.localize)('copyNotification', "Copy Text"); }
        constructor(id, label, clipboardService) {
            super(id, label);
            this.clipboardService = clipboardService;
        }
        run(notification) {
            return this.clipboardService.writeText(notification.message.raw);
        }
    };
    exports.CopyNotificationMessageAction = CopyNotificationMessageAction;
    exports.CopyNotificationMessageAction = CopyNotificationMessageAction = __decorate([
        __param(2, clipboardService_1.IClipboardService)
    ], CopyNotificationMessageAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9ub3RpZmljYXRpb25zL25vdGlmaWNhdGlvbnNBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWFoRyxNQUFNLFNBQVMsR0FBRyxJQUFBLDJCQUFZLEVBQUMscUJBQXFCLEVBQUUsa0JBQU8sQ0FBQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLDZDQUE2QyxDQUFDLENBQUMsQ0FBQztJQUMzSSxNQUFNLFlBQVksR0FBRyxJQUFBLDJCQUFZLEVBQUMseUJBQXlCLEVBQUUsa0JBQU8sQ0FBQyxRQUFRLEVBQUUsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGlEQUFpRCxDQUFDLENBQUMsQ0FBQztJQUM1SixNQUFNLFFBQVEsR0FBRyxJQUFBLDJCQUFZLEVBQUMsb0JBQW9CLEVBQUUsa0JBQU8sQ0FBQyxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsVUFBVSxFQUFFLDRDQUE0QyxDQUFDLENBQUMsQ0FBQztJQUM3SSxNQUFNLFVBQVUsR0FBRyxJQUFBLDJCQUFZLEVBQUMsc0JBQXNCLEVBQUUsa0JBQU8sQ0FBQyxTQUFTLEVBQUUsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztJQUNuSixNQUFNLFlBQVksR0FBRyxJQUFBLDJCQUFZLEVBQUMsd0JBQXdCLEVBQUUsa0JBQU8sQ0FBQyxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLGdEQUFnRCxDQUFDLENBQUMsQ0FBQztJQUM3SixNQUFNLGFBQWEsR0FBRyxJQUFBLDJCQUFZLEVBQUMseUJBQXlCLEVBQUUsa0JBQU8sQ0FBQyxJQUFJLEVBQUUsSUFBQSxjQUFRLEVBQUMsZUFBZSxFQUFF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