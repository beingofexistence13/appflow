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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/notifications/notificationsList", "vs/base/common/event", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/contextkey/common/contextkey", "vs/platform/notification/common/notification", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/host/browser/host", "vs/base/common/async", "vs/base/common/types", "vs/workbench/common/contextkeys", "vs/css!./media/notificationsToasts"], function (require, exports, nls_1, lifecycle_1, dom_1, instantiation_1, notificationsList_1, event_1, layoutService_1, theme_1, themeService_1, colorRegistry_1, editorGroupsService_1, contextkey_1, notification_1, lifecycle_2, host_1, async_1, types_1, contextkeys_1) {
    "use strict";
    var NotificationsToasts_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationsToasts = void 0;
    var ToastVisibility;
    (function (ToastVisibility) {
        ToastVisibility[ToastVisibility["HIDDEN_OR_VISIBLE"] = 0] = "HIDDEN_OR_VISIBLE";
        ToastVisibility[ToastVisibility["HIDDEN"] = 1] = "HIDDEN";
        ToastVisibility[ToastVisibility["VISIBLE"] = 2] = "VISIBLE";
    })(ToastVisibility || (ToastVisibility = {}));
    let NotificationsToasts = class NotificationsToasts extends themeService_1.Themable {
        static { NotificationsToasts_1 = this; }
        static { this.MAX_WIDTH = 450; }
        static { this.MAX_NOTIFICATIONS = 3; }
        static { this.PURGE_TIMEOUT = {
            [notification_1.Severity.Info]: 15000,
            [notification_1.Severity.Warning]: 18000,
            [notification_1.Severity.Error]: 20000
        }; }
        static { this.SPAM_PROTECTION = {
            // Count for the number of notifications over 800ms...
            interval: 800,
            // ...and ensure we are not showing more than MAX_NOTIFICATIONS
            limit: NotificationsToasts_1.MAX_NOTIFICATIONS
        }; }
        get isVisible() { return !!this._isVisible; }
        constructor(container, model, instantiationService, layoutService, themeService, editorGroupService, contextKeyService, lifecycleService, hostService) {
            super(themeService);
            this.container = container;
            this.model = model;
            this.instantiationService = instantiationService;
            this.layoutService = layoutService;
            this.editorGroupService = editorGroupService;
            this.contextKeyService = contextKeyService;
            this.lifecycleService = lifecycleService;
            this.hostService = hostService;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._isVisible = false;
            this.mapNotificationToToast = new Map();
            this.mapNotificationToDisposable = new Map();
            this.notificationsToastsVisibleContextKey = contextkeys_1.NotificationsToastsVisibleContext.bindTo(this.contextKeyService);
            this.addedToastsIntervalCounter = new async_1.IntervalCounter(NotificationsToasts_1.SPAM_PROTECTION.interval);
            this.registerListeners();
        }
        registerListeners() {
            // Layout
            this._register(this.layoutService.onDidLayout(dimension => this.layout(dom_1.Dimension.lift(dimension))));
            // Delay some tasks until after we have restored
            // to reduce UI pressure from the startup phase
            this.lifecycleService.when(3 /* LifecyclePhase.Restored */).then(() => {
                // Show toast for initial notifications if any
                this.model.notifications.forEach(notification => this.addToast(notification));
                // Update toasts on notification changes
                this._register(this.model.onDidChangeNotification(e => this.onDidChangeNotification(e)));
            });
            // Filter
            this._register(this.model.onDidChangeFilter(filter => {
                if (filter === notification_1.NotificationsFilter.SILENT || filter === notification_1.NotificationsFilter.ERROR) {
                    this.hide();
                }
            }));
        }
        onDidChangeNotification(e) {
            switch (e.kind) {
                case 0 /* NotificationChangeType.ADD */:
                    return this.addToast(e.item);
                case 3 /* NotificationChangeType.REMOVE */:
                    return this.removeToast(e.item);
            }
        }
        addToast(item) {
            if (this.isNotificationsCenterVisible) {
                return; // do not show toasts while notification center is visible
            }
            if (item.priority === notification_1.NotificationPriority.SILENT) {
                return; // do not show toasts for silenced notifications
            }
            // Optimization: it is possible that a lot of notifications are being
            // added in a very short time. To prevent this kind of spam, we protect
            // against showing too many notifications at once. Since they can always
            // be accessed from the notification center, a user can always get to
            // them later on.
            // (see also https://github.com/microsoft/vscode/issues/107935)
            if (this.addedToastsIntervalCounter.increment() > NotificationsToasts_1.SPAM_PROTECTION.limit) {
                return;
            }
            // Optimization: showing a notification toast can be expensive
            // because of the associated animation. If the renderer is busy
            // doing actual work, the animation can cause a lot of slowdown
            // As such we use `scheduleAtNextAnimationFrame` to push out
            // the toast until the renderer has time to process it.
            // (see also https://github.com/microsoft/vscode/issues/107935)
            const itemDisposables = new lifecycle_1.DisposableStore();
            this.mapNotificationToDisposable.set(item, itemDisposables);
            itemDisposables.add((0, dom_1.scheduleAtNextAnimationFrame)(() => this.doAddToast(item, itemDisposables)));
        }
        doAddToast(item, itemDisposables) {
            // Lazily create toasts containers
            let notificationsToastsContainer = this.notificationsToastsContainer;
            if (!notificationsToastsContainer) {
                notificationsToastsContainer = this.notificationsToastsContainer = document.createElement('div');
                notificationsToastsContainer.classList.add('notifications-toasts');
                this.container.appendChild(notificationsToastsContainer);
            }
            // Make Visible
            notificationsToastsContainer.classList.add('visible');
            // Container
            const notificationToastContainer = document.createElement('div');
            notificationToastContainer.classList.add('notification-toast-container');
            const firstToast = notificationsToastsContainer.firstChild;
            if (firstToast) {
                notificationsToastsContainer.insertBefore(notificationToastContainer, firstToast); // always first
            }
            else {
                notificationsToastsContainer.appendChild(notificationToastContainer);
            }
            // Toast
            const notificationToast = document.createElement('div');
            notificationToast.classList.add('notification-toast');
            notificationToastContainer.appendChild(notificationToast);
            // Create toast with item and show
            const notificationList = this.instantiationService.createInstance(notificationsList_1.NotificationsList, notificationToast, {
                verticalScrollMode: 2 /* ScrollbarVisibility.Hidden */,
                widgetAriaLabel: (() => {
                    if (!item.source) {
                        return (0, nls_1.localize)('notificationAriaLabel', "{0}, notification", item.message.raw);
                    }
                    return (0, nls_1.localize)('notificationWithSourceAriaLabel', "{0}, source: {1}, notification", item.message.raw, item.source);
                })()
            });
            itemDisposables.add(notificationList);
            const toast = { item, list: notificationList, container: notificationToastContainer, toast: notificationToast };
            this.mapNotificationToToast.set(item, toast);
            // When disposed, remove as visible
            itemDisposables.add((0, lifecycle_1.toDisposable)(() => this.updateToastVisibility(toast, false)));
            // Make visible
            notificationList.show();
            // Layout lists
            const maxDimensions = this.computeMaxDimensions();
            this.layoutLists(maxDimensions.width);
            // Show notification
            notificationList.updateNotificationsList(0, 0, [item]);
            // Layout container: only after we show the notification to ensure that
            // the height computation takes the content of it into account!
            this.layoutContainer(maxDimensions.height);
            // Re-draw entire item when expansion changes to reveal or hide details
            itemDisposables.add(item.onDidChangeExpansion(() => {
                notificationList.updateNotificationsList(0, 1, [item]);
            }));
            // Handle content changes
            // - actions: re-draw to properly show them
            // - message: update notification height unless collapsed
            itemDisposables.add(item.onDidChangeContent(e => {
                switch (e.kind) {
                    case 2 /* NotificationViewItemContentChangeKind.ACTIONS */:
                        notificationList.updateNotificationsList(0, 1, [item]);
                        break;
                    case 1 /* NotificationViewItemContentChangeKind.MESSAGE */:
                        if (item.expanded) {
                            notificationList.updateNotificationHeight(item);
                        }
                        break;
                }
            }));
            // Remove when item gets closed
            event_1.Event.once(item.onDidClose)(() => {
                this.removeToast(item);
            });
            // Automatically purge non-sticky notifications
            this.purgeNotification(item, notificationToastContainer, notificationList, itemDisposables);
            // Theming
            this.updateStyles();
            // Context Key
            this.notificationsToastsVisibleContextKey.set(true);
            // Animate in
            notificationToast.classList.add('notification-fade-in');
            itemDisposables.add((0, dom_1.addDisposableListener)(notificationToast, 'transitionend', () => {
                notificationToast.classList.remove('notification-fade-in');
                notificationToast.classList.add('notification-fade-in-done');
            }));
            // Mark as visible
            item.updateVisibility(true);
            // Events
            if (!this._isVisible) {
                this._isVisible = true;
                this._onDidChangeVisibility.fire();
            }
        }
        purgeNotification(item, notificationToastContainer, notificationList, disposables) {
            // Track mouse over item
            let isMouseOverToast = false;
            disposables.add((0, dom_1.addDisposableListener)(notificationToastContainer, dom_1.EventType.MOUSE_OVER, () => isMouseOverToast = true));
            disposables.add((0, dom_1.addDisposableListener)(notificationToastContainer, dom_1.EventType.MOUSE_OUT, () => isMouseOverToast = false));
            // Install Timers to Purge Notification
            let purgeTimeoutHandle;
            let listener;
            const hideAfterTimeout = () => {
                purgeTimeoutHandle = setTimeout(() => {
                    // If the window does not have focus, we wait for the window to gain focus
                    // again before triggering the timeout again. This prevents an issue where
                    // focussing the window could immediately hide the notification because the
                    // timeout was triggered again.
                    if (!this.hostService.hasFocus) {
                        if (!listener) {
                            listener = this.hostService.onDidChangeFocus(focus => {
                                if (focus) {
                                    hideAfterTimeout();
                                }
                            });
                            disposables.add(listener);
                        }
                    }
                    // Otherwise...
                    else if (item.sticky || // never hide sticky notifications
                        notificationList.hasFocus() || // never hide notifications with focus
                        isMouseOverToast // never hide notifications under mouse
                    ) {
                        hideAfterTimeout();
                    }
                    else {
                        this.removeToast(item);
                    }
                }, NotificationsToasts_1.PURGE_TIMEOUT[item.severity]);
            };
            hideAfterTimeout();
            disposables.add((0, lifecycle_1.toDisposable)(() => clearTimeout(purgeTimeoutHandle)));
        }
        removeToast(item) {
            let focusEditor = false;
            // UI
            const notificationToast = this.mapNotificationToToast.get(item);
            if (notificationToast) {
                const toastHasDOMFocus = (0, dom_1.isAncestor)(document.activeElement, notificationToast.container);
                if (toastHasDOMFocus) {
                    focusEditor = !(this.focusNext() || this.focusPrevious()); // focus next if any, otherwise focus editor
                }
                this.mapNotificationToToast.delete(item);
            }
            // Disposables
            const notificationDisposables = this.mapNotificationToDisposable.get(item);
            if (notificationDisposables) {
                (0, lifecycle_1.dispose)(notificationDisposables);
                this.mapNotificationToDisposable.delete(item);
            }
            // Layout if we still have toasts
            if (this.mapNotificationToToast.size > 0) {
                this.layout(this.workbenchDimensions);
            }
            // Otherwise hide if no more toasts to show
            else {
                this.doHide();
                // Move focus back to editor group as needed
                if (focusEditor) {
                    this.editorGroupService.activeGroup.focus();
                }
            }
        }
        removeToasts() {
            // Toast
            this.mapNotificationToToast.clear();
            // Disposables
            this.mapNotificationToDisposable.forEach(disposable => (0, lifecycle_1.dispose)(disposable));
            this.mapNotificationToDisposable.clear();
            this.doHide();
        }
        doHide() {
            this.notificationsToastsContainer?.classList.remove('visible');
            // Context Key
            this.notificationsToastsVisibleContextKey.set(false);
            // Events
            if (this._isVisible) {
                this._isVisible = false;
                this._onDidChangeVisibility.fire();
            }
        }
        hide() {
            const focusEditor = this.notificationsToastsContainer ? (0, dom_1.isAncestor)(document.activeElement, this.notificationsToastsContainer) : false;
            this.removeToasts();
            if (focusEditor) {
                this.editorGroupService.activeGroup.focus();
            }
        }
        focus() {
            const toasts = this.getToasts(ToastVisibility.VISIBLE);
            if (toasts.length > 0) {
                toasts[0].list.focusFirst();
                return true;
            }
            return false;
        }
        focusNext() {
            const toasts = this.getToasts(ToastVisibility.VISIBLE);
            for (let i = 0; i < toasts.length; i++) {
                const toast = toasts[i];
                if (toast.list.hasFocus()) {
                    const nextToast = toasts[i + 1];
                    if (nextToast) {
                        nextToast.list.focusFirst();
                        return true;
                    }
                    break;
                }
            }
            return false;
        }
        focusPrevious() {
            const toasts = this.getToasts(ToastVisibility.VISIBLE);
            for (let i = 0; i < toasts.length; i++) {
                const toast = toasts[i];
                if (toast.list.hasFocus()) {
                    const previousToast = toasts[i - 1];
                    if (previousToast) {
                        previousToast.list.focusFirst();
                        return true;
                    }
                    break;
                }
            }
            return false;
        }
        focusFirst() {
            const toast = this.getToasts(ToastVisibility.VISIBLE)[0];
            if (toast) {
                toast.list.focusFirst();
                return true;
            }
            return false;
        }
        focusLast() {
            const toasts = this.getToasts(ToastVisibility.VISIBLE);
            if (toasts.length > 0) {
                toasts[toasts.length - 1].list.focusFirst();
                return true;
            }
            return false;
        }
        update(isCenterVisible) {
            if (this.isNotificationsCenterVisible !== isCenterVisible) {
                this.isNotificationsCenterVisible = isCenterVisible;
                // Hide all toasts when the notificationcenter gets visible
                if (this.isNotificationsCenterVisible) {
                    this.removeToasts();
                }
            }
        }
        updateStyles() {
            this.mapNotificationToToast.forEach(({ toast }) => {
                const backgroundColor = this.getColor(theme_1.NOTIFICATIONS_BACKGROUND);
                toast.style.background = backgroundColor ? backgroundColor : '';
                const widgetShadowColor = this.getColor(colorRegistry_1.widgetShadow);
                toast.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
                const borderColor = this.getColor(theme_1.NOTIFICATIONS_TOAST_BORDER);
                toast.style.border = borderColor ? `1px solid ${borderColor}` : '';
            });
        }
        getToasts(state) {
            const notificationToasts = [];
            this.mapNotificationToToast.forEach(toast => {
                switch (state) {
                    case ToastVisibility.HIDDEN_OR_VISIBLE:
                        notificationToasts.push(toast);
                        break;
                    case ToastVisibility.HIDDEN:
                        if (!this.isToastInDOM(toast)) {
                            notificationToasts.push(toast);
                        }
                        break;
                    case ToastVisibility.VISIBLE:
                        if (this.isToastInDOM(toast)) {
                            notificationToasts.push(toast);
                        }
                        break;
                }
            });
            return notificationToasts.reverse(); // from newest to oldest
        }
        layout(dimension) {
            this.workbenchDimensions = dimension;
            const maxDimensions = this.computeMaxDimensions();
            // Hide toasts that exceed height
            if (maxDimensions.height) {
                this.layoutContainer(maxDimensions.height);
            }
            // Layout all lists of toasts
            this.layoutLists(maxDimensions.width);
        }
        computeMaxDimensions() {
            const maxWidth = NotificationsToasts_1.MAX_WIDTH;
            let availableWidth = maxWidth;
            let availableHeight;
            if (this.workbenchDimensions) {
                // Make sure notifications are not exceding available width
                availableWidth = this.workbenchDimensions.width;
                availableWidth -= (2 * 8); // adjust for paddings left and right
                // Make sure notifications are not exceeding available height
                availableHeight = this.workbenchDimensions.height;
                if (this.layoutService.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */)) {
                    availableHeight -= 22; // adjust for status bar
                }
                if (this.layoutService.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */)) {
                    availableHeight -= 22; // adjust for title bar
                }
                availableHeight -= (2 * 12); // adjust for paddings top and bottom
            }
            availableHeight = typeof availableHeight === 'number'
                ? Math.round(availableHeight * 0.618) // try to not cover the full height for stacked toasts
                : 0;
            return new dom_1.Dimension(Math.min(maxWidth, availableWidth), availableHeight);
        }
        layoutLists(width) {
            this.mapNotificationToToast.forEach(({ list }) => list.layout(width));
        }
        layoutContainer(heightToGive) {
            let visibleToasts = 0;
            for (const toast of this.getToasts(ToastVisibility.HIDDEN_OR_VISIBLE)) {
                // In order to measure the client height, the element cannot have display: none
                toast.container.style.opacity = '0';
                this.updateToastVisibility(toast, true);
                heightToGive -= toast.container.offsetHeight;
                let makeVisible = false;
                if (visibleToasts === NotificationsToasts_1.MAX_NOTIFICATIONS) {
                    makeVisible = false; // never show more than MAX_NOTIFICATIONS
                }
                else if (heightToGive >= 0) {
                    makeVisible = true; // hide toast if available height is too little
                }
                // Hide or show toast based on context
                this.updateToastVisibility(toast, makeVisible);
                toast.container.style.opacity = '';
                if (makeVisible) {
                    visibleToasts++;
                }
            }
        }
        updateToastVisibility(toast, visible) {
            if (this.isToastInDOM(toast) === visible) {
                return;
            }
            // Update visibility in DOM
            const notificationsToastsContainer = (0, types_1.assertIsDefined)(this.notificationsToastsContainer);
            if (visible) {
                notificationsToastsContainer.appendChild(toast.container);
            }
            else {
                notificationsToastsContainer.removeChild(toast.container);
            }
            // Update visibility in model
            toast.item.updateVisibility(visible);
        }
        isToastInDOM(toast) {
            return !!toast.container.parentElement;
        }
    };
    exports.NotificationsToasts = NotificationsToasts;
    exports.NotificationsToasts = NotificationsToasts = NotificationsToasts_1 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, layoutService_1.IWorkbenchLayoutService),
        __param(4, themeService_1.IThemeService),
        __param(5, editorGroupsService_1.IEditorGroupsService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, lifecycle_2.ILifecycleService),
        __param(8, host_1.IHostService)
    ], NotificationsToasts);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc1RvYXN0cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uc1RvYXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBZ0NoRyxJQUFLLGVBSUo7SUFKRCxXQUFLLGVBQWU7UUFDbkIsK0VBQWlCLENBQUE7UUFDakIseURBQU0sQ0FBQTtRQUNOLDJEQUFPLENBQUE7SUFDUixDQUFDLEVBSkksZUFBZSxLQUFmLGVBQWUsUUFJbkI7SUFFTSxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHVCQUFROztpQkFFeEIsY0FBUyxHQUFHLEdBQUcsQUFBTixDQUFPO2lCQUNoQixzQkFBaUIsR0FBRyxDQUFDLEFBQUosQ0FBSztpQkFFdEIsa0JBQWEsR0FBbUM7WUFDdkUsQ0FBQyx1QkFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUs7WUFDdEIsQ0FBQyx1QkFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUs7WUFDekIsQ0FBQyx1QkFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUs7U0FDdkIsQUFKb0MsQ0FJbkM7aUJBRXNCLG9CQUFlLEdBQUc7WUFDekMsc0RBQXNEO1lBQ3RELFFBQVEsRUFBRSxHQUFHO1lBQ2IsK0RBQStEO1lBQy9ELEtBQUssRUFBRSxxQkFBbUIsQ0FBQyxpQkFBaUI7U0FDNUMsQUFMc0MsQ0FLckM7UUFNRixJQUFJLFNBQVMsS0FBYyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQWF0RCxZQUNrQixTQUFzQixFQUN0QixLQUEwQixFQUNwQixvQkFBNEQsRUFDMUQsYUFBdUQsRUFDakUsWUFBMkIsRUFDcEIsa0JBQXlELEVBQzNELGlCQUFzRCxFQUN2RCxnQkFBb0QsRUFDekQsV0FBMEM7WUFFeEQsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBVkgsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUN0QixVQUFLLEdBQUwsS0FBSyxDQUFxQjtZQUNILHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDekMsa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBRXpDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBc0I7WUFDMUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1lBQ3hDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBMUJ4QywyQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNyRSwwQkFBcUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBRTNELGVBQVUsR0FBRyxLQUFLLENBQUM7WUFPViwyQkFBc0IsR0FBRyxJQUFJLEdBQUcsRUFBNkMsQ0FBQztZQUM5RSxnQ0FBMkIsR0FBRyxJQUFJLEdBQUcsRUFBc0MsQ0FBQztZQUU1RSx5Q0FBb0MsR0FBRywrQ0FBaUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFeEcsK0JBQTBCLEdBQUcsSUFBSSx1QkFBZSxDQUFDLHFCQUFtQixDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQWUvRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBRXhCLFNBQVM7WUFDVCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXBHLGdEQUFnRDtZQUNoRCwrQ0FBK0M7WUFDL0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksaUNBQXlCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFFN0QsOENBQThDO2dCQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBRTlFLHdDQUF3QztnQkFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRixDQUFDLENBQUMsQ0FBQztZQUVILFNBQVM7WUFDVCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3BELElBQUksTUFBTSxLQUFLLGtDQUFtQixDQUFDLE1BQU0sSUFBSSxNQUFNLEtBQUssa0NBQW1CLENBQUMsS0FBSyxFQUFFO29CQUNsRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQ1o7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLHVCQUF1QixDQUFDLENBQTJCO1lBQzFELFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRTtnQkFDZjtvQkFDQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QjtvQkFDQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pDO1FBQ0YsQ0FBQztRQUVPLFFBQVEsQ0FBQyxJQUEyQjtZQUMzQyxJQUFJLElBQUksQ0FBQyw0QkFBNEIsRUFBRTtnQkFDdEMsT0FBTyxDQUFDLDBEQUEwRDthQUNsRTtZQUVELElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxtQ0FBb0IsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2xELE9BQU8sQ0FBQyxnREFBZ0Q7YUFDeEQ7WUFFRCxxRUFBcUU7WUFDckUsdUVBQXVFO1lBQ3ZFLHdFQUF3RTtZQUN4RSxxRUFBcUU7WUFDckUsaUJBQWlCO1lBQ2pCLCtEQUErRDtZQUMvRCxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLEVBQUUsR0FBRyxxQkFBbUIsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFO2dCQUM1RixPQUFPO2FBQ1A7WUFFRCw4REFBOEQ7WUFDOUQsK0RBQStEO1lBQy9ELCtEQUErRDtZQUMvRCw0REFBNEQ7WUFDNUQsdURBQXVEO1lBQ3ZELCtEQUErRDtZQUMvRCxNQUFNLGVBQWUsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztZQUM1RCxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUEsa0NBQTRCLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7UUFFTyxVQUFVLENBQUMsSUFBMkIsRUFBRSxlQUFnQztZQUUvRSxrQ0FBa0M7WUFDbEMsSUFBSSw0QkFBNEIsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUM7WUFDckUsSUFBSSxDQUFDLDRCQUE0QixFQUFFO2dCQUNsQyw0QkFBNEIsR0FBRyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakcsNEJBQTRCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUVuRSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2FBQ3pEO1lBRUQsZUFBZTtZQUNmLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdEQsWUFBWTtZQUNaLE1BQU0sMEJBQTBCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqRSwwQkFBMEIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFFekUsTUFBTSxVQUFVLEdBQUcsNEJBQTRCLENBQUMsVUFBVSxDQUFDO1lBQzNELElBQUksVUFBVSxFQUFFO2dCQUNmLDRCQUE0QixDQUFDLFlBQVksQ0FBQywwQkFBMEIsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLGVBQWU7YUFDbEc7aUJBQU07Z0JBQ04sNEJBQTRCLENBQUMsV0FBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7YUFDckU7WUFFRCxRQUFRO1lBQ1IsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hELGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN0RCwwQkFBMEIsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUUxRCxrQ0FBa0M7WUFDbEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHFDQUFpQixFQUFFLGlCQUFpQixFQUFFO2dCQUN2RyxrQkFBa0Isb0NBQTRCO2dCQUM5QyxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUU7b0JBRXRCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNqQixPQUFPLElBQUEsY0FBUSxFQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ2hGO29CQUNELE9BQU8sSUFBQSxjQUFRLEVBQUMsaUNBQWlDLEVBQUUsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNySCxDQUFDLENBQUMsRUFBRTthQUNKLENBQUMsQ0FBQztZQUNILGVBQWUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUV0QyxNQUFNLEtBQUssR0FBdUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSwwQkFBMEIsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQztZQUNwSSxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUU3QyxtQ0FBbUM7WUFDbkMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbEYsZUFBZTtZQUNmLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO1lBRXhCLGVBQWU7WUFDZixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNsRCxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUV0QyxvQkFBb0I7WUFDcEIsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFdkQsdUVBQXVFO1lBQ3ZFLCtEQUErRDtZQUMvRCxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUzQyx1RUFBdUU7WUFDdkUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFO2dCQUNsRCxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUoseUJBQXlCO1lBQ3pCLDJDQUEyQztZQUMzQyx5REFBeUQ7WUFDekQsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQy9DLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRTtvQkFDZjt3QkFDQyxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDdkQsTUFBTTtvQkFDUDt3QkFDQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7NEJBQ2xCLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUNoRDt3QkFDRCxNQUFNO2lCQUNQO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLCtCQUErQjtZQUMvQixhQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7WUFFSCwrQ0FBK0M7WUFDL0MsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSwwQkFBMEIsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUU1RixVQUFVO1lBQ1YsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXBCLGNBQWM7WUFDZCxJQUFJLENBQUMsb0NBQW9DLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBELGFBQWE7WUFDYixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDeEQsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFBLDJCQUFxQixFQUFDLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUU7Z0JBQ2xGLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDM0QsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixrQkFBa0I7WUFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTVCLFNBQVM7WUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNuQztRQUNGLENBQUM7UUFFTyxpQkFBaUIsQ0FBQyxJQUEyQixFQUFFLDBCQUF1QyxFQUFFLGdCQUFtQyxFQUFFLFdBQTRCO1lBRWhLLHdCQUF3QjtZQUN4QixJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQztZQUM3QixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsMEJBQTBCLEVBQUUsZUFBUyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hILFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSwyQkFBcUIsRUFBQywwQkFBMEIsRUFBRSxlQUFTLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFeEgsdUNBQXVDO1lBQ3ZDLElBQUksa0JBQXVCLENBQUM7WUFDNUIsSUFBSSxRQUFxQixDQUFDO1lBRTFCLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxFQUFFO2dCQUU3QixrQkFBa0IsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUVwQywwRUFBMEU7b0JBQzFFLDBFQUEwRTtvQkFDMUUsMkVBQTJFO29CQUMzRSwrQkFBK0I7b0JBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTt3QkFDL0IsSUFBSSxDQUFDLFFBQVEsRUFBRTs0QkFDZCxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQ0FDcEQsSUFBSSxLQUFLLEVBQUU7b0NBQ1YsZ0JBQWdCLEVBQUUsQ0FBQztpQ0FDbkI7NEJBQ0YsQ0FBQyxDQUFDLENBQUM7NEJBQ0gsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt5QkFDMUI7cUJBQ0Q7b0JBRUQsZUFBZTt5QkFDVixJQUNKLElBQUksQ0FBQyxNQUFNLElBQVcsa0NBQWtDO3dCQUN4RCxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBTyxzQ0FBc0M7d0JBQ3hFLGdCQUFnQixDQUFPLHVDQUF1QztzQkFDN0Q7d0JBQ0QsZ0JBQWdCLEVBQUUsQ0FBQztxQkFDbkI7eUJBQU07d0JBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDdkI7Z0JBQ0YsQ0FBQyxFQUFFLHFCQUFtQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUM7WUFFRixnQkFBZ0IsRUFBRSxDQUFDO1lBRW5CLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRU8sV0FBVyxDQUFDLElBQTJCO1lBQzlDLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztZQUV4QixLQUFLO1lBQ0wsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hFLElBQUksaUJBQWlCLEVBQUU7Z0JBQ3RCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxnQkFBVSxFQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3pGLElBQUksZ0JBQWdCLEVBQUU7b0JBQ3JCLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsNENBQTRDO2lCQUN2RztnQkFFRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3pDO1lBRUQsY0FBYztZQUNkLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRSxJQUFJLHVCQUF1QixFQUFFO2dCQUM1QixJQUFBLG1CQUFPLEVBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFFakMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM5QztZQUVELGlDQUFpQztZQUNqQyxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsMkNBQTJDO2lCQUN0QztnQkFDSixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBRWQsNENBQTRDO2dCQUM1QyxJQUFJLFdBQVcsRUFBRTtvQkFDaEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDNUM7YUFDRDtRQUNGLENBQUM7UUFFTyxZQUFZO1lBRW5CLFFBQVE7WUFDUixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFcEMsY0FBYztZQUNkLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFBLG1CQUFPLEVBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFekMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVPLE1BQU07WUFDYixJQUFJLENBQUMsNEJBQTRCLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUUvRCxjQUFjO1lBQ2QsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVyRCxTQUFTO1lBQ1QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRSxDQUFDO2FBQ25DO1FBQ0YsQ0FBQztRQUVELElBQUk7WUFDSCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLElBQUEsZ0JBQVUsRUFBQyxRQUFRLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFFdEksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXBCLElBQUksV0FBVyxFQUFFO2dCQUNoQixJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQzVDO1FBQ0YsQ0FBQztRQUVELEtBQUs7WUFDSixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUU1QixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsU0FBUztZQUNSLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN2QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDMUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDaEMsSUFBSSxTQUFTLEVBQUU7d0JBQ2QsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzt3QkFFNUIsT0FBTyxJQUFJLENBQUM7cUJBQ1o7b0JBRUQsTUFBTTtpQkFDTjthQUNEO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsYUFBYTtZQUNaLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN2QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDMUIsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsSUFBSSxhQUFhLEVBQUU7d0JBQ2xCLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBRWhDLE9BQU8sSUFBSSxDQUFDO3FCQUNaO29CQUVELE1BQU07aUJBQ047YUFDRDtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELFVBQVU7WUFDVCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLEtBQUssRUFBRTtnQkFDVixLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUV4QixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRUQsU0FBUztZQUNSLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFFNUMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELE1BQU0sQ0FBQyxlQUF3QjtZQUM5QixJQUFJLElBQUksQ0FBQyw0QkFBNEIsS0FBSyxlQUFlLEVBQUU7Z0JBQzFELElBQUksQ0FBQyw0QkFBNEIsR0FBRyxlQUFlLENBQUM7Z0JBRXBELDJEQUEyRDtnQkFDM0QsSUFBSSxJQUFJLENBQUMsNEJBQTRCLEVBQUU7b0JBQ3RDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztpQkFDcEI7YUFDRDtRQUNGLENBQUM7UUFFUSxZQUFZO1lBQ3BCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7Z0JBQ2pELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0NBQXdCLENBQUMsQ0FBQztnQkFDaEUsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFFaEUsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLDRCQUFZLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGVBQWUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUVwRixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGtDQUEwQixDQUFDLENBQUM7Z0JBQzlELEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsYUFBYSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLFNBQVMsQ0FBQyxLQUFzQjtZQUN2QyxNQUFNLGtCQUFrQixHQUF5QixFQUFFLENBQUM7WUFFcEQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDM0MsUUFBUSxLQUFLLEVBQUU7b0JBQ2QsS0FBSyxlQUFlLENBQUMsaUJBQWlCO3dCQUNyQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQy9CLE1BQU07b0JBQ1AsS0FBSyxlQUFlLENBQUMsTUFBTTt3QkFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUU7NEJBQzlCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDL0I7d0JBQ0QsTUFBTTtvQkFDUCxLQUFLLGVBQWUsQ0FBQyxPQUFPO3dCQUMzQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUU7NEJBQzdCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDL0I7d0JBQ0QsTUFBTTtpQkFDUDtZQUNGLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QjtRQUM5RCxDQUFDO1FBRUQsTUFBTSxDQUFDLFNBQWdDO1lBQ3RDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUM7WUFFckMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFFbEQsaUNBQWlDO1lBQ2pDLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDekIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDM0M7WUFFRCw2QkFBNkI7WUFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVPLG9CQUFvQjtZQUMzQixNQUFNLFFBQVEsR0FBRyxxQkFBbUIsQ0FBQyxTQUFTLENBQUM7WUFFL0MsSUFBSSxjQUFjLEdBQUcsUUFBUSxDQUFDO1lBQzlCLElBQUksZUFBbUMsQ0FBQztZQUV4QyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFFN0IsMkRBQTJEO2dCQUMzRCxjQUFjLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztnQkFDaEQsY0FBYyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMscUNBQXFDO2dCQUVoRSw2REFBNkQ7Z0JBQzdELGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDO2dCQUNsRCxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyx3REFBc0IsRUFBRTtvQkFDdkQsZUFBZSxJQUFJLEVBQUUsQ0FBQyxDQUFDLHdCQUF3QjtpQkFDL0M7Z0JBRUQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsc0RBQXFCLEVBQUU7b0JBQ3RELGVBQWUsSUFBSSxFQUFFLENBQUMsQ0FBQyx1QkFBdUI7aUJBQzlDO2dCQUVELGVBQWUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLHFDQUFxQzthQUNsRTtZQUVELGVBQWUsR0FBRyxPQUFPLGVBQWUsS0FBSyxRQUFRO2dCQUNwRCxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDLENBQUMsc0RBQXNEO2dCQUM1RixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUwsT0FBTyxJQUFJLGVBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRU8sV0FBVyxDQUFDLEtBQWE7WUFDaEMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRU8sZUFBZSxDQUFDLFlBQW9CO1lBQzNDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztZQUN0QixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBRXRFLCtFQUErRTtnQkFDL0UsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFeEMsWUFBWSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO2dCQUU3QyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7Z0JBQ3hCLElBQUksYUFBYSxLQUFLLHFCQUFtQixDQUFDLGlCQUFpQixFQUFFO29CQUM1RCxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMseUNBQXlDO2lCQUM5RDtxQkFBTSxJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUU7b0JBQzdCLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQywrQ0FBK0M7aUJBQ25FO2dCQUVELHNDQUFzQztnQkFDdEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDL0MsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFFbkMsSUFBSSxXQUFXLEVBQUU7b0JBQ2hCLGFBQWEsRUFBRSxDQUFDO2lCQUNoQjthQUNEO1FBQ0YsQ0FBQztRQUVPLHFCQUFxQixDQUFDLEtBQXlCLEVBQUUsT0FBZ0I7WUFDeEUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLE9BQU8sRUFBRTtnQkFDekMsT0FBTzthQUNQO1lBRUQsMkJBQTJCO1lBQzNCLE1BQU0sNEJBQTRCLEdBQUcsSUFBQSx1QkFBZSxFQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQ3hGLElBQUksT0FBTyxFQUFFO2dCQUNaLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDMUQ7aUJBQU07Z0JBQ04sNEJBQTRCLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUMxRDtZQUVELDZCQUE2QjtZQUM3QixLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFTyxZQUFZLENBQUMsS0FBeUI7WUFDN0MsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7UUFDeEMsQ0FBQzs7SUFyakJXLGtEQUFtQjtrQ0FBbkIsbUJBQW1CO1FBc0M3QixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsdUNBQXVCLENBQUE7UUFDdkIsV0FBQSw0QkFBYSxDQUFBO1FBQ2IsV0FBQSwwQ0FBb0IsQ0FBQTtRQUNwQixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSxtQkFBWSxDQUFBO09BNUNGLG1CQUFtQixDQXNqQi9CIn0=