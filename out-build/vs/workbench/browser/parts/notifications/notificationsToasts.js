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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/notifications/notificationsToasts", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/notifications/notificationsList", "vs/base/common/event", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/contextkey/common/contextkey", "vs/platform/notification/common/notification", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/host/browser/host", "vs/base/common/async", "vs/base/common/types", "vs/workbench/common/contextkeys", "vs/css!./media/notificationsToasts"], function (require, exports, nls_1, lifecycle_1, dom_1, instantiation_1, notificationsList_1, event_1, layoutService_1, theme_1, themeService_1, colorRegistry_1, editorGroupsService_1, contextkey_1, notification_1, lifecycle_2, host_1, async_1, types_1, contextkeys_1) {
    "use strict";
    var $d2b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$d2b = void 0;
    var ToastVisibility;
    (function (ToastVisibility) {
        ToastVisibility[ToastVisibility["HIDDEN_OR_VISIBLE"] = 0] = "HIDDEN_OR_VISIBLE";
        ToastVisibility[ToastVisibility["HIDDEN"] = 1] = "HIDDEN";
        ToastVisibility[ToastVisibility["VISIBLE"] = 2] = "VISIBLE";
    })(ToastVisibility || (ToastVisibility = {}));
    let $d2b = class $d2b extends themeService_1.$nv {
        static { $d2b_1 = this; }
        static { this.a = 450; }
        static { this.b = 3; }
        static { this.c = {
            [notification_1.Severity.Info]: 15000,
            [notification_1.Severity.Warning]: 18000,
            [notification_1.Severity.Error]: 20000
        }; }
        static { this.f = {
            // Count for the number of notifications over 800ms...
            interval: 800,
            // ...and ensure we are not showing more than MAX_NOTIFICATIONS
            limit: $d2b_1.b
        }; }
        get isVisible() { return !!this.j; }
        constructor(D, F, G, H, themeService, I, J, L, M) {
            super(themeService);
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.L = L;
            this.M = M;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.g.event;
            this.j = false;
            this.t = new Map();
            this.u = new Map();
            this.y = contextkeys_1.$xdb.bindTo(this.J);
            this.C = new async_1.$1g($d2b_1.f.interval);
            this.N();
        }
        N() {
            // Layout
            this.B(this.H.onDidLayout(dimension => this.layout(dom_1.$BO.lift(dimension))));
            // Delay some tasks until after we have restored
            // to reduce UI pressure from the startup phase
            this.L.when(3 /* LifecyclePhase.Restored */).then(() => {
                // Show toast for initial notifications if any
                this.F.notifications.forEach(notification => this.P(notification));
                // Update toasts on notification changes
                this.B(this.F.onDidChangeNotification(e => this.O(e)));
            });
            // Filter
            this.B(this.F.onDidChangeFilter(filter => {
                if (filter === notification_1.NotificationsFilter.SILENT || filter === notification_1.NotificationsFilter.ERROR) {
                    this.hide();
                }
            }));
        }
        O(e) {
            switch (e.kind) {
                case 0 /* NotificationChangeType.ADD */:
                    return this.P(e.item);
                case 3 /* NotificationChangeType.REMOVE */:
                    return this.S(e.item);
            }
        }
        P(item) {
            if (this.s) {
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
            if (this.C.increment() > $d2b_1.f.limit) {
                return;
            }
            // Optimization: showing a notification toast can be expensive
            // because of the associated animation. If the renderer is busy
            // doing actual work, the animation can cause a lot of slowdown
            // As such we use `scheduleAtNextAnimationFrame` to push out
            // the toast until the renderer has time to process it.
            // (see also https://github.com/microsoft/vscode/issues/107935)
            const itemDisposables = new lifecycle_1.$jc();
            this.u.set(item, itemDisposables);
            itemDisposables.add((0, dom_1.$vO)(() => this.Q(item, itemDisposables)));
        }
        Q(item, itemDisposables) {
            // Lazily create toasts containers
            let notificationsToastsContainer = this.m;
            if (!notificationsToastsContainer) {
                notificationsToastsContainer = this.m = document.createElement('div');
                notificationsToastsContainer.classList.add('notifications-toasts');
                this.D.appendChild(notificationsToastsContainer);
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
            const notificationList = this.G.createInstance(notificationsList_1.$_1b, notificationToast, {
                verticalScrollMode: 2 /* ScrollbarVisibility.Hidden */,
                widgetAriaLabel: (() => {
                    if (!item.source) {
                        return (0, nls_1.localize)(0, null, item.message.raw);
                    }
                    return (0, nls_1.localize)(1, null, item.message.raw, item.source);
                })()
            });
            itemDisposables.add(notificationList);
            const toast = { item, list: notificationList, container: notificationToastContainer, toast: notificationToast };
            this.t.set(item, toast);
            // When disposed, remove as visible
            itemDisposables.add((0, lifecycle_1.$ic)(() => this.ab(toast, false)));
            // Make visible
            notificationList.show();
            // Layout lists
            const maxDimensions = this.Y();
            this.Z(maxDimensions.width);
            // Show notification
            notificationList.updateNotificationsList(0, 0, [item]);
            // Layout container: only after we show the notification to ensure that
            // the height computation takes the content of it into account!
            this.$(maxDimensions.height);
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
                this.S(item);
            });
            // Automatically purge non-sticky notifications
            this.R(item, notificationToastContainer, notificationList, itemDisposables);
            // Theming
            this.updateStyles();
            // Context Key
            this.y.set(true);
            // Animate in
            notificationToast.classList.add('notification-fade-in');
            itemDisposables.add((0, dom_1.$nO)(notificationToast, 'transitionend', () => {
                notificationToast.classList.remove('notification-fade-in');
                notificationToast.classList.add('notification-fade-in-done');
            }));
            // Mark as visible
            item.updateVisibility(true);
            // Events
            if (!this.j) {
                this.j = true;
                this.g.fire();
            }
        }
        R(item, notificationToastContainer, notificationList, disposables) {
            // Track mouse over item
            let isMouseOverToast = false;
            disposables.add((0, dom_1.$nO)(notificationToastContainer, dom_1.$3O.MOUSE_OVER, () => isMouseOverToast = true));
            disposables.add((0, dom_1.$nO)(notificationToastContainer, dom_1.$3O.MOUSE_OUT, () => isMouseOverToast = false));
            // Install Timers to Purge Notification
            let purgeTimeoutHandle;
            let listener;
            const hideAfterTimeout = () => {
                purgeTimeoutHandle = setTimeout(() => {
                    // If the window does not have focus, we wait for the window to gain focus
                    // again before triggering the timeout again. This prevents an issue where
                    // focussing the window could immediately hide the notification because the
                    // timeout was triggered again.
                    if (!this.M.hasFocus) {
                        if (!listener) {
                            listener = this.M.onDidChangeFocus(focus => {
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
                        this.S(item);
                    }
                }, $d2b_1.c[item.severity]);
            };
            hideAfterTimeout();
            disposables.add((0, lifecycle_1.$ic)(() => clearTimeout(purgeTimeoutHandle)));
        }
        S(item) {
            let focusEditor = false;
            // UI
            const notificationToast = this.t.get(item);
            if (notificationToast) {
                const toastHasDOMFocus = (0, dom_1.$NO)(document.activeElement, notificationToast.container);
                if (toastHasDOMFocus) {
                    focusEditor = !(this.focusNext() || this.focusPrevious()); // focus next if any, otherwise focus editor
                }
                this.t.delete(item);
            }
            // Disposables
            const notificationDisposables = this.u.get(item);
            if (notificationDisposables) {
                (0, lifecycle_1.$fc)(notificationDisposables);
                this.u.delete(item);
            }
            // Layout if we still have toasts
            if (this.t.size > 0) {
                this.layout(this.r);
            }
            // Otherwise hide if no more toasts to show
            else {
                this.W();
                // Move focus back to editor group as needed
                if (focusEditor) {
                    this.I.activeGroup.focus();
                }
            }
        }
        U() {
            // Toast
            this.t.clear();
            // Disposables
            this.u.forEach(disposable => (0, lifecycle_1.$fc)(disposable));
            this.u.clear();
            this.W();
        }
        W() {
            this.m?.classList.remove('visible');
            // Context Key
            this.y.set(false);
            // Events
            if (this.j) {
                this.j = false;
                this.g.fire();
            }
        }
        hide() {
            const focusEditor = this.m ? (0, dom_1.$NO)(document.activeElement, this.m) : false;
            this.U();
            if (focusEditor) {
                this.I.activeGroup.focus();
            }
        }
        focus() {
            const toasts = this.X(ToastVisibility.VISIBLE);
            if (toasts.length > 0) {
                toasts[0].list.focusFirst();
                return true;
            }
            return false;
        }
        focusNext() {
            const toasts = this.X(ToastVisibility.VISIBLE);
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
            const toasts = this.X(ToastVisibility.VISIBLE);
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
            const toast = this.X(ToastVisibility.VISIBLE)[0];
            if (toast) {
                toast.list.focusFirst();
                return true;
            }
            return false;
        }
        focusLast() {
            const toasts = this.X(ToastVisibility.VISIBLE);
            if (toasts.length > 0) {
                toasts[toasts.length - 1].list.focusFirst();
                return true;
            }
            return false;
        }
        update(isCenterVisible) {
            if (this.s !== isCenterVisible) {
                this.s = isCenterVisible;
                // Hide all toasts when the notificationcenter gets visible
                if (this.s) {
                    this.U();
                }
            }
        }
        updateStyles() {
            this.t.forEach(({ toast }) => {
                const backgroundColor = this.z(theme_1.$0ab);
                toast.style.background = backgroundColor ? backgroundColor : '';
                const widgetShadowColor = this.z(colorRegistry_1.$Kv);
                toast.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
                const borderColor = this.z(theme_1.$8ab);
                toast.style.border = borderColor ? `1px solid ${borderColor}` : '';
            });
        }
        X(state) {
            const notificationToasts = [];
            this.t.forEach(toast => {
                switch (state) {
                    case ToastVisibility.HIDDEN_OR_VISIBLE:
                        notificationToasts.push(toast);
                        break;
                    case ToastVisibility.HIDDEN:
                        if (!this.bb(toast)) {
                            notificationToasts.push(toast);
                        }
                        break;
                    case ToastVisibility.VISIBLE:
                        if (this.bb(toast)) {
                            notificationToasts.push(toast);
                        }
                        break;
                }
            });
            return notificationToasts.reverse(); // from newest to oldest
        }
        layout(dimension) {
            this.r = dimension;
            const maxDimensions = this.Y();
            // Hide toasts that exceed height
            if (maxDimensions.height) {
                this.$(maxDimensions.height);
            }
            // Layout all lists of toasts
            this.Z(maxDimensions.width);
        }
        Y() {
            const maxWidth = $d2b_1.a;
            let availableWidth = maxWidth;
            let availableHeight;
            if (this.r) {
                // Make sure notifications are not exceding available width
                availableWidth = this.r.width;
                availableWidth -= (2 * 8); // adjust for paddings left and right
                // Make sure notifications are not exceeding available height
                availableHeight = this.r.height;
                if (this.H.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */)) {
                    availableHeight -= 22; // adjust for status bar
                }
                if (this.H.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */)) {
                    availableHeight -= 22; // adjust for title bar
                }
                availableHeight -= (2 * 12); // adjust for paddings top and bottom
            }
            availableHeight = typeof availableHeight === 'number'
                ? Math.round(availableHeight * 0.618) // try to not cover the full height for stacked toasts
                : 0;
            return new dom_1.$BO(Math.min(maxWidth, availableWidth), availableHeight);
        }
        Z(width) {
            this.t.forEach(({ list }) => list.layout(width));
        }
        $(heightToGive) {
            let visibleToasts = 0;
            for (const toast of this.X(ToastVisibility.HIDDEN_OR_VISIBLE)) {
                // In order to measure the client height, the element cannot have display: none
                toast.container.style.opacity = '0';
                this.ab(toast, true);
                heightToGive -= toast.container.offsetHeight;
                let makeVisible = false;
                if (visibleToasts === $d2b_1.b) {
                    makeVisible = false; // never show more than MAX_NOTIFICATIONS
                }
                else if (heightToGive >= 0) {
                    makeVisible = true; // hide toast if available height is too little
                }
                // Hide or show toast based on context
                this.ab(toast, makeVisible);
                toast.container.style.opacity = '';
                if (makeVisible) {
                    visibleToasts++;
                }
            }
        }
        ab(toast, visible) {
            if (this.bb(toast) === visible) {
                return;
            }
            // Update visibility in DOM
            const notificationsToastsContainer = (0, types_1.$uf)(this.m);
            if (visible) {
                notificationsToastsContainer.appendChild(toast.container);
            }
            else {
                notificationsToastsContainer.removeChild(toast.container);
            }
            // Update visibility in model
            toast.item.updateVisibility(visible);
        }
        bb(toast) {
            return !!toast.container.parentElement;
        }
    };
    exports.$d2b = $d2b;
    exports.$d2b = $d2b = $d2b_1 = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, layoutService_1.$Meb),
        __param(4, themeService_1.$gv),
        __param(5, editorGroupsService_1.$5C),
        __param(6, contextkey_1.$3i),
        __param(7, lifecycle_2.$7y),
        __param(8, host_1.$VT)
    ], $d2b);
});
//# sourceMappingURL=notificationsToasts.js.map