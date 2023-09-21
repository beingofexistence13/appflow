/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/notification/common/notification"], function (require, exports, event_1, lifecycle_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I0b = void 0;
    class $I0b {
        constructor() {
            this.onDidAddNotification = event_1.Event.None;
            this.onDidRemoveNotification = event_1.Event.None;
            this.onDidChangeDoNotDisturbMode = event_1.Event.None;
            this.doNotDisturbMode = false;
        }
        static { this.a = new notification_1.$Zu(); }
        info(message) {
            return this.notify({ severity: notification_1.Severity.Info, message });
        }
        warn(message) {
            return this.notify({ severity: notification_1.Severity.Warning, message });
        }
        error(error) {
            return this.notify({ severity: notification_1.Severity.Error, message: error });
        }
        notify(notification) {
            return $I0b.a;
        }
        prompt(severity, message, choices, options) {
            return $I0b.a;
        }
        status(message, options) {
            return lifecycle_1.$kc.None;
        }
    }
    exports.$I0b = $I0b;
});
//# sourceMappingURL=testNotificationService.js.map