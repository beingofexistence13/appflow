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
define(["require", "exports", "vs/nls", "vs/platform/notification/common/notification", "vs/workbench/common/notifications", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/base/common/actions", "vs/platform/storage/common/storage"], function (require, exports, nls_1, notification_1, notifications_1, lifecycle_1, event_1, extensions_1, actions_1, storage_1) {
    "use strict";
    var NotificationService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationService = void 0;
    let NotificationService = class NotificationService extends lifecycle_1.Disposable {
        static { NotificationService_1 = this; }
        constructor(storageService) {
            super();
            this.storageService = storageService;
            this.model = this._register(new notifications_1.NotificationsModel());
            this._onDidAddNotification = this._register(new event_1.Emitter());
            this.onDidAddNotification = this._onDidAddNotification.event;
            this._onDidRemoveNotification = this._register(new event_1.Emitter());
            this.onDidRemoveNotification = this._onDidRemoveNotification.event;
            this._onDidChangeDoNotDisturbMode = this._register(new event_1.Emitter());
            this.onDidChangeDoNotDisturbMode = this._onDidChangeDoNotDisturbMode.event;
            this._doNotDisturbMode = this.storageService.getBoolean(NotificationService_1.DND_SETTINGS_KEY, -1 /* StorageScope.APPLICATION */, false);
            this.updateDoNotDisturbFilters();
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.model.onDidChangeNotification(e => {
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
                            this._onDidAddNotification.fire(notification);
                        }
                        if (e.kind === 3 /* NotificationChangeType.REMOVE */) {
                            this._onDidRemoveNotification.fire(notification);
                        }
                        break;
                    }
                }
            }));
        }
        //#region Do not disturb mode
        static { this.DND_SETTINGS_KEY = 'notifications.doNotDisturbMode'; }
        get doNotDisturbMode() {
            return this._doNotDisturbMode;
        }
        set doNotDisturbMode(enabled) {
            if (this._doNotDisturbMode === enabled) {
                return; // no change
            }
            this.storageService.store(NotificationService_1.DND_SETTINGS_KEY, enabled, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            this._doNotDisturbMode = enabled;
            // Toggle via filter
            this.updateDoNotDisturbFilters();
            // Events
            this._onDidChangeDoNotDisturbMode.fire();
        }
        updateDoNotDisturbFilters() {
            let filter;
            if (this._doNotDisturbMode) {
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
            const toDispose = new lifecycle_1.DisposableStore();
            // Handle neverShowAgain option accordingly
            if (notification.neverShowAgain) {
                const scope = this.toStorageScope(notification.neverShowAgain);
                const id = notification.neverShowAgain.id;
                // If the user already picked to not show the notification
                // again, we return with a no-op notification here
                if (this.storageService.getBoolean(id, scope)) {
                    return new notification_1.NoOpNotification();
                }
                const neverShowAgainAction = toDispose.add(new actions_1.Action('workbench.notification.neverShowAgain', (0, nls_1.localize)('neverShowAgain', "Don't Show Again"), undefined, true, async () => {
                    // Close notification
                    handle.close();
                    // Remember choice
                    this.storageService.store(id, true, scope, 0 /* StorageTarget.USER */);
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
        toStorageScope(options) {
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
            const toDispose = new lifecycle_1.DisposableStore();
            // Handle neverShowAgain option accordingly
            if (options?.neverShowAgain) {
                const scope = this.toStorageScope(options.neverShowAgain);
                const id = options.neverShowAgain.id;
                // If the user already picked to not show the notification
                // again, we return with a no-op notification here
                if (this.storageService.getBoolean(id, scope)) {
                    return new notification_1.NoOpNotification();
                }
                const neverShowAgainChoice = {
                    label: (0, nls_1.localize)('neverShowAgain', "Don't Show Again"),
                    run: () => this.storageService.store(id, true, scope, 0 /* StorageTarget.USER */),
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
                const action = new notifications_1.ChoiceAction(`workbench.dialog.choice.${index}`, choice);
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
    exports.NotificationService = NotificationService;
    exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
        __param(0, storage_1.IStorageService)
    ], NotificationService);
    (0, extensions_1.registerSingleton)(notification_1.INotificationService, NotificationService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9ub3RpZmljYXRpb24vY29tbW9uL25vdGlmaWNhdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQVd6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVOztRQWVsRCxZQUNrQixjQUFnRDtZQUVqRSxLQUFLLEVBQUUsQ0FBQztZQUYwQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFaekQsVUFBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxrQ0FBa0IsRUFBRSxDQUFDLENBQUM7WUFFekMsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBaUIsQ0FBQyxDQUFDO1lBQzdFLHlCQUFvQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7WUFFaEQsNkJBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBaUIsQ0FBQyxDQUFDO1lBQ2hGLDRCQUF1QixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUM7WUFFdEQsaUNBQTRCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDM0UsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEtBQUssQ0FBQztZQXlDdkUsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMscUJBQW1CLENBQUMsZ0JBQWdCLHFDQUE0QixLQUFLLENBQUMsQ0FBQztZQWxDakksSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7WUFDakMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFD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