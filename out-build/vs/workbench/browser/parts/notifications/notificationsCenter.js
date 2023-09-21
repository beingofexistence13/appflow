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
define(["require", "exports", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/workbench/browser/parts/notifications/notificationsList", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dom", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/nls!vs/workbench/browser/parts/notifications/notificationsCenter", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/notifications/notificationsActions", "vs/platform/keybinding/common/keybinding", "vs/base/common/types", "vs/workbench/common/contextkeys", "vs/platform/notification/common/notification", "vs/css!./media/notificationsCenter", "vs/css!./media/notificationsActions"], function (require, exports, theme_1, themeService_1, layoutService_1, event_1, contextkey_1, notificationsCommands_1, notificationsList_1, instantiation_1, dom_1, colorRegistry_1, editorGroupsService_1, nls_1, actionbar_1, notificationsActions_1, keybinding_1, types_1, contextkeys_1, notification_1) {
    "use strict";
    var $a2b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a2b = void 0;
    let $a2b = class $a2b extends themeService_1.$nv {
        static { $a2b_1 = this; }
        static { this.a = new dom_1.$BO(450, 400); }
        constructor(y, C, themeService, D, F, G, H, I, J) {
            super(themeService);
            this.y = y;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.b.event;
            this.s = contextkeys_1.$wdb.bindTo(this.G);
            this.s = contextkeys_1.$wdb.bindTo(G);
            this.L();
        }
        L() {
            this.B(this.C.onDidChangeNotification(e => this.Q(e)));
            this.B(this.F.onDidLayout(dimension => this.layout(dom_1.$BO.lift(dimension))));
            this.B(this.J.onDidChangeDoNotDisturbMode(() => this.M()));
        }
        M() {
            this.hide(); // hide the notification center when do not disturb is toggled
        }
        get isVisible() {
            return !!this.m;
        }
        show() {
            if (this.m) {
                const notificationsList = (0, types_1.$uf)(this.j);
                // Make visible
                notificationsList.show();
                // Focus first
                notificationsList.focusFirst();
                return; // already visible
            }
            // Lazily create if showing for the first time
            if (!this.c) {
                this.O();
            }
            // Title
            this.N();
            // Make visible
            const [notificationsList, notificationsCenterContainer] = (0, types_1.$vf)(this.j, this.c);
            this.m = true;
            notificationsCenterContainer.classList.add('visible');
            notificationsList.show();
            // Layout
            this.layout(this.r);
            // Show all notifications that are present now
            notificationsList.updateNotificationsList(0, 0, this.C.notifications);
            // Focus first
            notificationsList.focusFirst();
            // Theming
            this.updateStyles();
            // Mark as visible
            this.C.notifications.forEach(notification => notification.updateVisibility(true));
            // Context Key
            this.s.set(true);
            // Event
            this.b.fire();
        }
        N() {
            const [notificationsCenterTitle, clearAllAction] = (0, types_1.$vf)(this.g, this.t);
            if (this.C.notifications.length === 0) {
                notificationsCenterTitle.textContent = (0, nls_1.localize)(0, null);
                clearAllAction.enabled = false;
            }
            else {
                notificationsCenterTitle.textContent = (0, nls_1.localize)(1, null);
                clearAllAction.enabled = this.C.notifications.some(notification => !notification.hasProgress);
            }
        }
        O() {
            // Container
            this.c = document.createElement('div');
            this.c.classList.add('notifications-center');
            // Header
            this.f = document.createElement('div');
            this.f.classList.add('notifications-center-header');
            this.c.appendChild(this.f);
            // Header Title
            this.g = document.createElement('span');
            this.g.classList.add('notifications-center-header-title');
            this.f.appendChild(this.g);
            // Header Toolbar
            const toolbarContainer = document.createElement('div');
            toolbarContainer.classList.add('notifications-center-header-toolbar');
            this.f.appendChild(toolbarContainer);
            const actionRunner = this.B(this.D.createInstance(notificationsCommands_1.$bJb));
            const notificationsToolBar = this.B(new actionbar_1.$1P(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)(2, null),
                actionRunner
            }));
            this.t = this.B(this.D.createInstance(notificationsActions_1.$21b, notificationsActions_1.$21b.ID, notificationsActions_1.$21b.LABEL));
            notificationsToolBar.push(this.t, { icon: true, label: false, keybinding: this.P(this.t) });
            this.u = this.B(this.D.createInstance(notificationsActions_1.$31b, notificationsActions_1.$31b.ID, notificationsActions_1.$31b.LABEL));
            notificationsToolBar.push(this.u, { icon: true, label: false, keybinding: this.P(this.u) });
            const hideAllAction = this.B(this.D.createInstance(notificationsActions_1.$41b, notificationsActions_1.$41b.ID, notificationsActions_1.$41b.LABEL));
            notificationsToolBar.push(hideAllAction, { icon: true, label: false, keybinding: this.P(hideAllAction) });
            // Notifications List
            this.j = this.D.createInstance(notificationsList_1.$_1b, this.c, {
                widgetAriaLabel: (0, nls_1.localize)(3, null)
            });
            this.y.appendChild(this.c);
        }
        P(action) {
            const keybinding = this.I.lookupKeybinding(action.id);
            return keybinding ? keybinding.getLabel() : null;
        }
        Q(e) {
            if (!this.m) {
                return; // only if visible
            }
            let focusEditor = false;
            // Update notifications list based on event kind
            const [notificationsList, notificationsCenterContainer] = (0, types_1.$vf)(this.j, this.c);
            switch (e.kind) {
                case 0 /* NotificationChangeType.ADD */:
                    notificationsList.updateNotificationsList(e.index, 0, [e.item]);
                    e.item.updateVisibility(true);
                    break;
                case 1 /* NotificationChangeType.CHANGE */:
                    // Handle content changes
                    // - actions: re-draw to properly show them
                    // - message: update notification height unless collapsed
                    switch (e.detail) {
                        case 2 /* NotificationViewItemContentChangeKind.ACTIONS */:
                            notificationsList.updateNotificationsList(e.index, 1, [e.item]);
                            break;
                        case 1 /* NotificationViewItemContentChangeKind.MESSAGE */:
                            if (e.item.expanded) {
                                notificationsList.updateNotificationHeight(e.item);
                            }
                            break;
                    }
                    break;
                case 2 /* NotificationChangeType.EXPAND_COLLAPSE */:
                    // Re-draw entire item when expansion changes to reveal or hide details
                    notificationsList.updateNotificationsList(e.index, 1, [e.item]);
                    break;
                case 3 /* NotificationChangeType.REMOVE */:
                    focusEditor = (0, dom_1.$NO)(document.activeElement, notificationsCenterContainer);
                    notificationsList.updateNotificationsList(e.index, 1);
                    e.item.updateVisibility(false);
                    break;
            }
            // Update title
            this.N();
            // Hide if no more notifications to show
            if (this.C.notifications.length === 0) {
                this.hide();
                // Restore focus to editor group if we had focus
                if (focusEditor) {
                    this.H.activeGroup.focus();
                }
            }
        }
        hide() {
            if (!this.m || !this.c || !this.j) {
                return; // already hidden
            }
            const focusEditor = (0, dom_1.$NO)(document.activeElement, this.c);
            // Hide
            this.m = false;
            this.c.classList.remove('visible');
            this.j.hide();
            // Mark as hidden
            this.C.notifications.forEach(notification => notification.updateVisibility(false));
            // Context Key
            this.s.set(false);
            // Event
            this.b.fire();
            // Restore focus to editor group if we had focus
            if (focusEditor) {
                this.H.activeGroup.focus();
            }
        }
        updateStyles() {
            if (this.c && this.f) {
                const widgetShadowColor = this.z(colorRegistry_1.$Kv);
                this.c.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
                const borderColor = this.z(theme_1.$7ab);
                this.c.style.border = borderColor ? `1px solid ${borderColor}` : '';
                const headerForeground = this.z(theme_1.$_ab);
                this.f.style.color = headerForeground ?? '';
                const headerBackground = this.z(theme_1.$abb);
                this.f.style.background = headerBackground ?? '';
            }
        }
        layout(dimension) {
            this.r = dimension;
            if (this.m && this.c) {
                const maxWidth = $a2b_1.a.width;
                const maxHeight = $a2b_1.a.height;
                let availableWidth = maxWidth;
                let availableHeight = maxHeight;
                if (this.r) {
                    // Make sure notifications are not exceding available width
                    availableWidth = this.r.width;
                    availableWidth -= (2 * 8); // adjust for paddings left and right
                    // Make sure notifications are not exceeding available height
                    availableHeight = this.r.height - 35 /* header */;
                    if (this.F.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */)) {
                        availableHeight -= 22; // adjust for status bar
                    }
                    if (this.F.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */)) {
                        availableHeight -= 22; // adjust for title bar
                    }
                    availableHeight -= (2 * 12); // adjust for paddings top and bottom
                }
                // Apply to list
                const notificationsList = (0, types_1.$uf)(this.j);
                notificationsList.layout(Math.min(maxWidth, availableWidth), Math.min(maxHeight, availableHeight));
            }
        }
        clearAll() {
            // Hide notifications center first
            this.hide();
            // Close all
            for (const notification of [...this.C.notifications] /* copy array since we modify it from closing */) {
                if (!notification.hasProgress) {
                    notification.close();
                }
            }
        }
    };
    exports.$a2b = $a2b;
    exports.$a2b = $a2b = $a2b_1 = __decorate([
        __param(2, themeService_1.$gv),
        __param(3, instantiation_1.$Ah),
        __param(4, layoutService_1.$Meb),
        __param(5, contextkey_1.$3i),
        __param(6, editorGroupsService_1.$5C),
        __param(7, keybinding_1.$2D),
        __param(8, notification_1.$Yu)
    ], $a2b);
});
//# sourceMappingURL=notificationsCenter.js.map