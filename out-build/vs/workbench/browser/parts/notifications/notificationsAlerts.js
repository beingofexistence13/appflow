/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/nls!vs/workbench/browser/parts/notifications/notificationsAlerts", "vs/base/common/lifecycle", "vs/base/common/errorMessage", "vs/platform/notification/common/notification", "vs/base/common/event"], function (require, exports, aria_1, nls_1, lifecycle_1, errorMessage_1, notification_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$b2b = void 0;
    class $b2b extends lifecycle_1.$kc {
        constructor(a) {
            super();
            this.a = a;
            // Alert initial notifications if any
            for (const notification of a.notifications) {
                this.f(notification);
            }
            this.b();
        }
        b() {
            this.B(this.a.onDidChangeNotification(e => this.c(e)));
        }
        c(e) {
            if (e.kind === 0 /* NotificationChangeType.ADD */) {
                // ARIA alert for screen readers
                this.f(e.item);
                // Always log errors to console with full details
                if (e.item.severity === notification_1.Severity.Error) {
                    if (e.item.message.original instanceof Error) {
                        console.error(e.item.message.original);
                    }
                    else {
                        console.error((0, errorMessage_1.$mi)(e.item.message.linkedText.toString(), true));
                    }
                }
            }
        }
        f(notification) {
            if (notification.priority === notification_1.NotificationPriority.SILENT) {
                return;
            }
            // Trigger the alert again whenever the message changes
            const listener = notification.onDidChangeContent(e => {
                if (e.kind === 1 /* NotificationViewItemContentChangeKind.MESSAGE */) {
                    this.g(notification);
                }
            });
            event_1.Event.once(notification.onDidClose)(() => listener.dispose());
            this.g(notification);
        }
        g(notification) {
            let alertText;
            if (notification.severity === notification_1.Severity.Error) {
                alertText = (0, nls_1.localize)(0, null, notification.message.linkedText.toString());
            }
            else if (notification.severity === notification_1.Severity.Warning) {
                alertText = (0, nls_1.localize)(1, null, notification.message.linkedText.toString());
            }
            else {
                alertText = (0, nls_1.localize)(2, null, notification.message.linkedText.toString());
            }
            (0, aria_1.$$P)(alertText);
        }
    }
    exports.$b2b = $b2b;
});
//# sourceMappingURL=notificationsAlerts.js.map