/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/severity", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, severity_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1u = exports.$Zu = exports.NotificationsFilter = exports.NeverShowAgainScope = exports.NotificationPriority = exports.$Yu = exports.Severity = void 0;
    exports.Severity = severity_1.default;
    exports.$Yu = (0, instantiation_1.$Bh)('notificationService');
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
    class $Zu {
        constructor() {
            this.progress = new $1u();
            this.onDidClose = event_1.Event.None;
            this.onDidChangeVisibility = event_1.Event.None;
        }
        updateSeverity(severity) { }
        updateMessage(message) { }
        updateActions(actions) { }
        close() { }
    }
    exports.$Zu = $Zu;
    class $1u {
        infinite() { }
        done() { }
        total(value) { }
        worked(value) { }
    }
    exports.$1u = $1u;
});
//# sourceMappingURL=notification.js.map