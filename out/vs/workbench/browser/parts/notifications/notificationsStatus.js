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
define(["require", "exports", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/lifecycle", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/nls", "vs/platform/notification/common/notification"], function (require, exports, statusbar_1, lifecycle_1, notificationsCommands_1, nls_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationsStatus = void 0;
    let NotificationsStatus = class NotificationsStatus extends lifecycle_1.Disposable {
        constructor(model, statusbarService, notificationService) {
            super();
            this.model = model;
            this.statusbarService = statusbarService;
            this.notificationService = notificationService;
            this.newNotificationsCount = 0;
            this.isNotificationsCenterVisible = false;
            this.isNotificationsToastsVisible = false;
            this.updateNotificationsCenterStatusItem();
            if (model.statusMessage) {
                this.doSetStatusMessage(model.statusMessage);
            }
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.model.onDidChangeNotification(e => this.onDidChangeNotification(e)));
            this._register(this.model.onDidChangeStatusMessage(e => this.onDidChangeStatusMessage(e)));
            this._register(this.notificationService.onDidChangeDoNotDisturbMode(() => this.updateNotificationsCenterStatusItem()));
        }
        onDidChangeNotification(e) {
            // Consider a notification as unread as long as it only
            // appeared as toast and not in the notification center
            if (!this.isNotificationsCenterVisible) {
                if (e.kind === 0 /* NotificationChangeType.ADD */) {
                    this.newNotificationsCount++;
                }
                else if (e.kind === 3 /* NotificationChangeType.REMOVE */ && this.newNotificationsCount > 0) {
                    this.newNotificationsCount--;
                }
            }
            // Update in status bar
            this.updateNotificationsCenterStatusItem();
        }
        updateNotificationsCenterStatusItem() {
            // Figure out how many notifications have progress only if neither
            // toasts are visible nor center is visible. In that case we still
            // want to give a hint to the user that something is running.
            let notificationsInProgress = 0;
            if (!this.isNotificationsCenterVisible && !this.isNotificationsToastsVisible) {
                for (const notification of this.model.notifications) {
                    if (notification.hasProgress) {
                        notificationsInProgress++;
                    }
                }
            }
            // Show the status bar entry depending on do not disturb setting
            let statusProperties = {
                name: (0, nls_1.localize)('status.notifications', "Notifications"),
                text: `${notificationsInProgress > 0 || this.newNotificationsCount > 0 ? '$(bell-dot)' : '$(bell)'}`,
                ariaLabel: (0, nls_1.localize)('status.notifications', "Notifications"),
                command: this.isNotificationsCenterVisible ? notificationsCommands_1.HIDE_NOTIFICATIONS_CENTER : notificationsCommands_1.SHOW_NOTIFICATIONS_CENTER,
                tooltip: this.getTooltip(notificationsInProgress),
                showBeak: this.isNotificationsCenterVisible
            };
            if (this.notificationService.doNotDisturbMode) {
                statusProperties = {
                    ...statusProperties,
                    text: `${notificationsInProgress > 0 || this.newNotificationsCount > 0 ? '$(bell-slash-dot)' : '$(bell-slash)'}`,
                    ariaLabel: (0, nls_1.localize)('status.doNotDisturb', "Do Not Disturb"),
                    tooltip: (0, nls_1.localize)('status.doNotDisturbTooltip', "Do Not Disturb Mode is Enabled")
                };
            }
            if (!this.notificationsCenterStatusItem) {
                this.notificationsCenterStatusItem = this.statusbarService.addEntry(statusProperties, 'status.notifications', 1 /* StatusbarAlignment.RIGHT */, -Number.MAX_VALUE /* towards the far end of the right hand side */);
            }
            else {
                this.notificationsCenterStatusItem.update(statusProperties);
            }
        }
        getTooltip(notificationsInProgress) {
            if (this.isNotificationsCenterVisible) {
                return (0, nls_1.localize)('hideNotifications', "Hide Notifications");
            }
            if (this.model.notifications.length === 0) {
                return (0, nls_1.localize)('zeroNotifications', "No Notifications");
            }
            if (notificationsInProgress === 0) {
                if (this.newNotificationsCount === 0) {
                    return (0, nls_1.localize)('noNotifications', "No New Notifications");
                }
                if (this.newNotificationsCount === 1) {
                    return (0, nls_1.localize)('oneNotification', "1 New Notification");
                }
                return (0, nls_1.localize)({ key: 'notifications', comment: ['{0} will be replaced by a number'] }, "{0} New Notifications", this.newNotificationsCount);
            }
            if (this.newNotificationsCount === 0) {
                return (0, nls_1.localize)({ key: 'noNotificationsWithProgress', comment: ['{0} will be replaced by a number'] }, "No New Notifications ({0} in progress)", notificationsInProgress);
            }
            if (this.newNotificationsCount === 1) {
                return (0, nls_1.localize)({ key: 'oneNotificationWithProgress', comment: ['{0} will be replaced by a number'] }, "1 New Notification ({0} in progress)", notificationsInProgress);
            }
            return (0, nls_1.localize)({ key: 'notificationsWithProgress', comment: ['{0} and {1} will be replaced by a number'] }, "{0} New Notifications ({1} in progress)", this.newNotificationsCount, notificationsInProgress);
        }
        update(isCenterVisible, isToastsVisible) {
            let updateNotificationsCenterStatusItem = false;
            if (this.isNotificationsCenterVisible !== isCenterVisible) {
                this.isNotificationsCenterVisible = isCenterVisible;
                this.newNotificationsCount = 0; // Showing the notification center resets the unread counter to 0
                updateNotificationsCenterStatusItem = true;
            }
            if (this.isNotificationsToastsVisible !== isToastsVisible) {
                this.isNotificationsToastsVisible = isToastsVisible;
                updateNotificationsCenterStatusItem = true;
            }
            // Update in status bar as needed
            if (updateNotificationsCenterStatusItem) {
                this.updateNotificationsCenterStatusItem();
            }
        }
        onDidChangeStatusMessage(e) {
            const statusItem = e.item;
            switch (e.kind) {
                // Show status notification
                case 0 /* StatusMessageChangeType.ADD */:
                    this.doSetStatusMessage(statusItem);
                    break;
                // Hide status notification (if its still the current one)
                case 1 /* StatusMessageChangeType.REMOVE */:
                    if (this.currentStatusMessage && this.currentStatusMessage[0] === statusItem) {
                        (0, lifecycle_1.dispose)(this.currentStatusMessage[1]);
                        this.currentStatusMessage = undefined;
                    }
                    break;
            }
        }
        doSetStatusMessage(item) {
            const message = item.message;
            const showAfter = item.options && typeof item.options.showAfter === 'number' ? item.options.showAfter : 0;
            const hideAfter = item.options && typeof item.options.hideAfter === 'number' ? item.options.hideAfter : -1;
            // Dismiss any previous
            if (this.currentStatusMessage) {
                (0, lifecycle_1.dispose)(this.currentStatusMessage[1]);
            }
            // Create new
            let statusMessageEntry;
            let showHandle = setTimeout(() => {
                statusMessageEntry = this.statusbarService.addEntry({
                    name: (0, nls_1.localize)('status.message', "Status Message"),
                    text: message,
                    ariaLabel: message
                }, 'status.message', 0 /* StatusbarAlignment.LEFT */, -Number.MAX_VALUE /* far right on left hand side */);
                showHandle = null;
            }, showAfter);
            // Dispose function takes care of timeouts and actual entry
            let hideHandle;
            const statusMessageDispose = {
                dispose: () => {
                    if (showHandle) {
                        clearTimeout(showHandle);
                    }
                    if (hideHandle) {
                        clearTimeout(hideHandle);
                    }
                    statusMessageEntry?.dispose();
                }
            };
            if (hideAfter > 0) {
                hideHandle = setTimeout(() => statusMessageDispose.dispose(), hideAfter);
            }
            // Remember as current status message
            this.currentStatusMessage = [item, statusMessageDispose];
        }
    };
    exports.NotificationsStatus = NotificationsStatus;
    exports.NotificationsStatus = NotificationsStatus = __decorate([
        __param(1, statusbar_1.IStatusbarService),
        __param(2, notification_1.INotificationService)
    ], NotificationsStatus);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc1N0YXR1cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uc1N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQVVsRCxZQUNrQixLQUEwQixFQUN4QixnQkFBb0QsRUFDakQsbUJBQTBEO1lBRWhGLEtBQUssRUFBRSxDQUFDO1lBSlMsVUFBSyxHQUFMLEtBQUssQ0FBcUI7WUFDUCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ2hDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFWekUsMEJBQXFCLEdBQUcsQ0FBQyxDQUFDO1lBSTFCLGlDQUE0QixHQUFZLEtBQUssQ0FBQztZQUM5QyxpQ0FBNEIsR0FBWSxLQUFLLENBQUM7WUFTckQsSUFBSSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7WUFFM0MsSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFO2dCQUN4QixJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQzdDO1lBRUQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx3QkFB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