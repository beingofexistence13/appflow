/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/errorMessage", "vs/platform/notification/common/notification", "vs/base/common/event"], function (require, exports, aria_1, nls_1, lifecycle_1, errorMessage_1, notification_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationsAlerts = void 0;
    class NotificationsAlerts extends lifecycle_1.Disposable {
        constructor(model) {
            super();
            this.model = model;
            // Alert initial notifications if any
            for (const notification of model.notifications) {
                this.triggerAriaAlert(notification);
            }
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.model.onDidChangeNotification(e => this.onDidChangeNotification(e)));
        }
        onDidChangeNotification(e) {
            if (e.kind === 0 /* NotificationChangeType.ADD */) {
                // ARIA alert for screen readers
                this.triggerAriaAlert(e.item);
                // Always log errors to console with full details
                if (e.item.severity === notification_1.Severity.Error) {
                    if (e.item.message.original instanceof Error) {
                        console.error(e.item.message.original);
                    }
                    else {
                        console.error((0, errorMessage_1.toErrorMessage)(e.item.message.linkedText.toString(), true));
                    }
                }
            }
        }
        triggerAriaAlert(notification) {
            if (notification.priority === notification_1.NotificationPriority.SILENT) {
                return;
            }
            // Trigger the alert again whenever the message changes
            const listener = notification.onDidChangeContent(e => {
                if (e.kind === 1 /* NotificationViewItemContentChangeKind.MESSAGE */) {
                    this.doTriggerAriaAlert(notification);
                }
            });
            event_1.Event.once(notification.onDidClose)(() => listener.dispose());
            this.doTriggerAriaAlert(notification);
        }
        doTriggerAriaAlert(notification) {
            let alertText;
            if (notification.severity === notification_1.Severity.Error) {
                alertText = (0, nls_1.localize)('alertErrorMessage', "Error: {0}", notification.message.linkedText.toString());
            }
            else if (notification.severity === notification_1.Severity.Warning) {
                alertText = (0, nls_1.localize)('alertWarningMessage', "Warning: {0}", notification.message.linkedText.toString());
            }
            else {
                alertText = (0, nls_1.localize)('alertInfoMessage', "Info: {0}", notification.message.linkedText.toString());
            }
            (0, aria_1.alert)(alertText);
        }
    }
    exports.NotificationsAlerts = NotificationsAlerts;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc0FsZXJ0cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uc0FsZXJ0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFVaEcsTUFBYSxtQkFBb0IsU0FBUSxzQkFBVTtRQUVsRCxZQUE2QixLQUEwQjtZQUN0RCxLQUFLLEVBQUUsQ0FBQztZQURvQixVQUFLLEdBQUwsS0FBSyxDQUFxQjtZQUd0RCxxQ0FBcUM7WUFDckMsS0FBSyxNQUFNLFlBQVksSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFO2dCQUMvQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDcEM7WUFFRCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUVPLHVCQUF1QixDQUFDLENBQTJCO1lBQzFELElBQUksQ0FBQyxDQUFDLElBQUksdUNBQStCLEVBQUU7Z0JBRTFDLGdDQUFnQztnQkFDaEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFOUIsaURBQWlEO2dCQUNqRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLHVCQUFRLENBQUMsS0FBSyxFQUFFO29CQUN2QyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsWUFBWSxLQUFLLEVBQUU7d0JBQzdDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQ3ZDO3lCQUFNO3dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBQSw2QkFBYyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3FCQUMxRTtpQkFDRDthQUNEO1FBQ0YsQ0FBQztRQUVPLGdCQUFnQixDQUFDLFlBQW1DO1lBQzNELElBQUksWUFBWSxDQUFDLFFBQVEsS0FBSyxtQ0FBb0IsQ0FBQyxNQUFNLEVBQUU7Z0JBQzFELE9BQU87YUFDUDtZQUVELHVEQUF1RDtZQUN2RCxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxDQUFDLElBQUksMERBQWtELEVBQUU7b0JBQzdELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDdEM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILGFBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRTlELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRU8sa0JBQWtCLENBQUMsWUFBbUM7WUFDN0QsSUFBSSxTQUFpQixDQUFDO1lBQ3RCLElBQUksWUFBWSxDQUFDLFFBQVEsS0FBSyx1QkFBUSxDQUFDLEtBQUssRUFBRTtnQkFDN0MsU0FBUyxHQUFHLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ3BHO2lCQUFNLElBQUksWUFBWSxDQUFDLFFBQVEsS0FBSyx1QkFBUSxDQUFDLE9BQU8sRUFBRTtnQkFDdEQsU0FBUyxHQUFHLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ3hHO2lCQUFNO2dCQUNOLFNBQVMsR0FBRyxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUNsRztZQUVELElBQUEsWUFBSyxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7S0FDRDtJQS9ERCxrREErREMifQ==