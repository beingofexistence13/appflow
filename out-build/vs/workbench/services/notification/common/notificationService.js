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
define(["require", "exports", "vs/nls!vs/workbench/services/notification/common/notificationService", "vs/platform/notification/common/notification", "vs/workbench/common/notifications", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/base/common/actions", "vs/platform/storage/common/storage"], function (require, exports, nls_1, notification_1, notifications_1, lifecycle_1, event_1, extensions_1, actions_1, storage_1) {
    "use strict";
    var $Qzb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Qzb = void 0;
    let $Qzb = class $Qzb extends lifecycle_1.$kc {
        static { $Qzb_1 = this; }
        constructor(f) {
            super();
            this.f = f;
            this.model = this.B(new notifications_1.$Lzb());
            this.a = this.B(new event_1.$fd());
            this.onDidAddNotification = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidRemoveNotification = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeDoNotDisturbMode = this.c.event;
            this.h = this.f.getBoolean($Qzb_1.DND_SETTINGS_KEY, -1 /* StorageScope.APPLICATION */, false);
            this.j();
            this.g();
        }
        g() {
            this.B(this.model.onDidChangeNotification(e => {
                switch (e.kind) {
                    case 0 /* NotificationChangeType.ADD */:
                    case 3 /* NotificationChangeType.REMOVE */: {
                        const notification = {
                            message: e.item.message.original,
                            severity: e.item.severity,
                            source: typeof e.item.sourceId === 'string' && typeof e.item.source === 'string' ? { id: e.item.sourceId, label: e.item.source } : e.item.source,
                            priority: e.item.priority
                        };
                        if (e.kind === 0 /* NotificationChangeType.ADD */) {
                            this.a.fire(notification);
                        }
                        if (e.kind === 3 /* NotificationChangeType.REMOVE */) {
                            this.b.fire(notification);
                        }
                        break;
                    }
                }
            }));
        }
        //#region Do not disturb mode
        static { this.DND_SETTINGS_KEY = 'notifications.doNotDisturbMode'; }
        get doNotDisturbMode() {
            return this.h;
        }
        set doNotDisturbMode(enabled) {
            if (this.h === enabled) {
                return; // no change
            }
            this.f.store($Qzb_1.DND_SETTINGS_KEY, enabled, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this.h = enabled;
            // Toggle via filter
            this.j();
            // Events
            this.c.fire();
        }
        j() {
            let filter;
            if (this.h) {
                filter = notification_1.NotificationsFilter.ERROR;
            }
            else {
                filter = notification_1.NotificationsFilter.OFF;
            }
            this.model.setFilter(filter);
        }
        //#endregion
        info(message) {
            if (Array.isArray(message)) {
                message.forEach(m => this.info(m));
                return;
            }
            this.model.addNotification({ severity: notification_1.Severity.Info, message });
        }
        warn(message) {
            if (Array.isArray(message)) {
                message.forEach(m => this.warn(m));
                return;
            }
            this.model.addNotification({ severity: notification_1.Severity.Warning, message });
        }
        error(message) {
            if (Array.isArray(message)) {
                message.forEach(m => this.error(m));
                return;
            }
            this.model.addNotification({ severity: notification_1.Severity.Error, message });
        }
        notify(notification) {
            const toDispose = new lifecycle_1.$jc();
            // Handle neverShowAgain option accordingly
            if (notification.neverShowAgain) {
                const scope = this.n(notification.neverShowAgain);
                const id = notification.neverShowAgain.id;
                // If the user already picked to not show the notification
                // again, we return with a no-op notification here
                if (this.f.getBoolean(id, scope)) {
                    return new notification_1.$Zu();
                }
                const neverShowAgainAction = toDispose.add(new actions_1.$gi('workbench.notification.neverShowAgain', (0, nls_1.localize)(0, null), undefined, true, async () => {
                    // Close notification
                    handle.close();
                    // Remember choice
                    this.f.store(id, true, scope, 0 /* StorageTarget.USER */);
                }));
                // Insert as primary or secondary action
                const actions = {
                    primary: notification.actions?.primary || [],
                    secondary: notification.actions?.secondary || []
                };
                if (!notification.neverShowAgain.isSecondary) {
                    actions.primary = [neverShowAgainAction, ...actions.primary]; // action comes first
                }
                else {
                    actions.secondary = [...actions.secondary, neverShowAgainAction]; // actions comes last
                }
                notification.actions = actions;
            }
            // Show notification
            const handle = this.model.addNotification(notification);
            // Cleanup when notification gets disposed
            event_1.Event.once(handle.onDidClose)(() => toDispose.dispose());
            return handle;
        }
        n(options) {
            switch (options.scope) {
                case notification_1.NeverShowAgainScope.APPLICATION:
                    return -1 /* StorageScope.APPLICATION */;
                case notification_1.NeverShowAgainScope.PROFILE:
                    return 0 /* StorageScope.PROFILE */;
                case notification_1.NeverShowAgainScope.WORKSPACE:
                    return 1 /* StorageScope.WORKSPACE */;
                default:
                    return -1 /* StorageScope.APPLICATION */;
            }
        }
        prompt(severity, message, choices, options) {
            const toDispose = new lifecycle_1.$jc();
            // Handle neverShowAgain option accordingly
            if (options?.neverShowAgain) {
                const scope = this.n(options.neverShowAgain);
                const id = options.neverShowAgain.id;
                // If the user already picked to not show the notification
                // again, we return with a no-op notification here
                if (this.f.getBoolean(id, scope)) {
                    return new notification_1.$Zu();
                }
                const neverShowAgainChoice = {
                    label: (0, nls_1.localize)(1, null),
                    run: () => this.f.store(id, true, scope, 0 /* StorageTarget.USER */),
                    isSecondary: options.neverShowAgain.isSecondary
                };
                // Insert as primary or secondary action
                if (!options.neverShowAgain.isSecondary) {
                    choices = [neverShowAgainChoice, ...choices]; // action comes first
                }
                else {
                    choices = [...choices, neverShowAgainChoice]; // actions comes last
                }
            }
            let choiceClicked = false;
            // Convert choices into primary/secondary actions
            const primaryActions = [];
            const secondaryActions = [];
            choices.forEach((choice, index) => {
                const action = new notifications_1.$Pzb(`workbench.dialog.choice.${index}`, choice);
                if (!choice.isSecondary) {
                    primaryActions.push(action);
                }
                else {
                    secondaryActions.push(action);
                }
                // React to action being clicked
                toDispose.add(action.onDidRun(() => {
                    choiceClicked = true;
                    // Close notification unless we are told to keep open
                    if (!choice.keepOpen) {
                        handle.close();
                    }
                }));
                toDispose.add(action);
            });
            // Show notification with actions
            const actions = { primary: primaryActions, secondary: secondaryActions };
            const handle = this.notify({ severity, message, actions, sticky: options?.sticky, priority: options?.priority });
            event_1.Event.once(handle.onDidClose)(() => {
                // Cleanup when notification gets disposed
                toDispose.dispose();
                // Indicate cancellation to the outside if no action was executed
                if (options && typeof options.onCancel === 'function' && !choiceClicked) {
                    options.onCancel();
                }
            });
            return handle;
        }
        status(message, options) {
            return this.model.showStatusMessage(message, options);
        }
    };
    exports.$Qzb = $Qzb;
    exports.$Qzb = $Qzb = $Qzb_1 = __decorate([
        __param(0, storage_1.$Vo)
    ], $Qzb);
    (0, extensions_1.$mr)(notification_1.$Yu, $Qzb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=notificationService.js.map