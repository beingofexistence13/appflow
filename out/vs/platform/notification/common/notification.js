/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/severity", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, severity_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoOpProgress = exports.NoOpNotification = exports.NotificationsFilter = exports.NeverShowAgainScope = exports.NotificationPriority = exports.INotificationService = exports.Severity = void 0;
    exports.Severity = severity_1.default;
    exports.INotificationService = (0, instantiation_1.createDecorator)('notificationService');
    var NotificationPriority;
    (function (NotificationPriority) {
        /**
         * Default priority: notification will be visible unless do not disturb mode is enabled.
         */
        NotificationPriority[NotificationPriority["DEFAULT"] = 0] = "DEFAULT";
        /**
         * Silent priority: notification will only be visible from the notifications center.
         */
        NotificationPriority[NotificationPriority["SILENT"] = 1] = "SILENT";
        /**
         * Urgent priority: notification will be visible even when do not disturb mode is enabled.
         */
        NotificationPriority[NotificationPriority["URGENT"] = 2] = "URGENT";
    })(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
    var NeverShowAgainScope;
    (function (NeverShowAgainScope) {
        /**
         * Will never show this notification on the current workspace again.
         */
        NeverShowAgainScope[NeverShowAgainScope["WORKSPACE"] = 0] = "WORKSPACE";
        /**
         * Will never show this notification on any workspace of the same
         * profile again.
         */
        NeverShowAgainScope[NeverShowAgainScope["PROFILE"] = 1] = "PROFILE";
        /**
         * Will never show this notification on any workspace across all
         * profiles again.
         */
        NeverShowAgainScope[NeverShowAgainScope["APPLICATION"] = 2] = "APPLICATION";
    })(NeverShowAgainScope || (exports.NeverShowAgainScope = NeverShowAgainScope = {}));
    var NotificationsFilter;
    (function (NotificationsFilter) {
        /**
         * No filter is enabled.
         */
        NotificationsFilter[NotificationsFilter["OFF"] = 0] = "OFF";
        /**
         * All notifications are configured as silent. See
         * `INotificationProperties.silent` for more info.
         */
        NotificationsFilter[NotificationsFilter["SILENT"] = 1] = "SILENT";
        /**
         * All notifications are silent except error notifications.
        */
        NotificationsFilter[NotificationsFilter["ERROR"] = 2] = "ERROR";
    })(NotificationsFilter || (exports.NotificationsFilter = NotificationsFilter = {}));
    class NoOpNotification {
        constructor() {
            this.progress = new NoOpProgress();
            this.onDidClose = event_1.Event.None;
            this.onDidChangeVisibility = event_1.Event.None;
        }
        updateSeverity(severity) { }
        updateMessage(message) { }
        updateActions(actions) { }
        close() { }
    }
    exports.NoOpNotification = NoOpNotification;
    class NoOpProgress {
        infinite() { }
        done() { }
        total(value) { }
        worked(value) { }
    }
    exports.NoOpProgress = NoOpProgress;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbm90aWZpY2F0aW9uL2NvbW1vbi9ub3RpZmljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWxGLFFBQUEsUUFBUSxHQUFHLGtCQUFZLENBQUM7SUFFekIsUUFBQSxvQkFBb0IsR0FBRyxJQUFBLCtCQUFlLEVBQXVCLHFCQUFxQixDQUFDLENBQUM7SUFJakcsSUFBWSxvQkFnQlg7SUFoQkQsV0FBWSxvQkFBb0I7UUFFL0I7O1dBRUc7UUFDSCxxRUFBTyxDQUFBO1FBRVA7O1dBRUc7UUFDSCxtRUFBTSxDQUFBO1FBRU47O1dBRUc7UUFDSCxtRUFBTSxDQUFBO0lBQ1AsQ0FBQyxFQWhCVyxvQkFBb0Isb0NBQXBCLG9CQUFvQixRQWdCL0I7SUF5QkQsSUFBWSxtQkFrQlg7SUFsQkQsV0FBWSxtQkFBbUI7UUFFOUI7O1dBRUc7UUFDSCx1RUFBUyxDQUFBO1FBRVQ7OztXQUdHO1FBQ0gsbUVBQU8sQ0FBQTtRQUVQOzs7V0FHRztRQUNILDJFQUFXLENBQUE7SUFDWixDQUFDLEVBbEJXLG1CQUFtQixtQ0FBbkIsbUJBQW1CLFFBa0I5QjtJQTRPRCxJQUFZLG1CQWlCWDtJQWpCRCxXQUFZLG1CQUFtQjtRQUU5Qjs7V0FFRztRQUNILDJEQUFHLENBQUE7UUFFSDs7O1dBR0c7UUFDSCxpRUFBTSxDQUFBO1FBRU47O1VBRUU7UUFDRiwrREFBSyxDQUFBO0lBQ04sQ0FBQyxFQWpCVyxtQkFBbUIsbUNBQW5CLG1CQUFtQixRQWlCOUI7SUF1RkQsTUFBYSxnQkFBZ0I7UUFBN0I7WUFFVSxhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUU5QixlQUFVLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUN4QiwwQkFBcUIsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1FBTzdDLENBQUM7UUFMQSxjQUFjLENBQUMsUUFBa0IsSUFBVSxDQUFDO1FBQzVDLGFBQWEsQ0FBQyxPQUE0QixJQUFVLENBQUM7UUFDckQsYUFBYSxDQUFDLE9BQThCLElBQVUsQ0FBQztRQUV2RCxLQUFLLEtBQVcsQ0FBQztLQUNqQjtJQVpELDRDQVlDO0lBRUQsTUFBYSxZQUFZO1FBQ3hCLFFBQVEsS0FBVyxDQUFDO1FBQ3BCLElBQUksS0FBVyxDQUFDO1FBQ2hCLEtBQUssQ0FBQyxLQUFhLElBQVUsQ0FBQztRQUM5QixNQUFNLENBQUMsS0FBYSxJQUFVLENBQUM7S0FDL0I7SUFMRCxvQ0FLQyJ9