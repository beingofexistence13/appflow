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
define(["require", "exports", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/workbench/browser/parts/notifications/notificationsList", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dom", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/editor/common/editorGroupsService", "vs/nls", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/browser/parts/notifications/notificationsActions", "vs/platform/keybinding/common/keybinding", "vs/base/common/types", "vs/workbench/common/contextkeys", "vs/platform/notification/common/notification", "vs/css!./media/notificationsCenter", "vs/css!./media/notificationsActions"], function (require, exports, theme_1, themeService_1, layoutService_1, event_1, contextkey_1, notificationsCommands_1, notificationsList_1, instantiation_1, dom_1, colorRegistry_1, editorGroupsService_1, nls_1, actionbar_1, notificationsActions_1, keybinding_1, types_1, contextkeys_1, notification_1) {
    "use strict";
    var NotificationsCenter_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationsCenter = void 0;
    let NotificationsCenter = class NotificationsCenter extends themeService_1.Themable {
        static { NotificationsCenter_1 = this; }
        static { this.MAX_DIMENSIONS = new dom_1.Dimension(450, 400); }
        constructor(container, model, themeService, instantiationService, layoutService, contextKeyService, editorGroupService, keybindingService, notificationService) {
            super(themeService);
            this.container = container;
            this.model = model;
            this.instantiationService = instantiationService;
            this.layoutService = layoutService;
            this.contextKeyService = contextKeyService;
            this.editorGroupService = editorGroupService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.notificationsCenterVisibleContextKey = contextkeys_1.NotificationsCenterVisibleContext.bindTo(this.contextKeyService);
            this.notificationsCenterVisibleContextKey = contextkeys_1.NotificationsCenterVisibleContext.bindTo(contextKeyService);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.model.onDidChangeNotification(e => this.onDidChangeNotification(e)));
            this._register(this.layoutService.onDidLayout(dimension => this.layout(dom_1.Dimension.lift(dimension))));
            this._register(this.notificationService.onDidChangeDoNotDisturbMode(() => this.onDidChangeDoNotDisturbMode()));
        }
        onDidChangeDoNotDisturbMode() {
            this.hide(); // hide the notification center when do not disturb is toggled
        }
        get isVisible() {
            return !!this._isVisible;
        }
        show() {
            if (this._isVisible) {
                const notificationsList = (0, types_1.assertIsDefined)(this.notificationsList);
                // Make visible
                notificationsList.show();
                // Focus first
                notificationsList.focusFirst();
                return; // already visible
            }
            // Lazily create if showing for the first time
            if (!this.notificationsCenterContainer) {
                this.create();
            }
            // Title
            this.updateTitle();
            // Make visible
            const [notificationsList, notificationsCenterContainer] = (0, types_1.assertAllDefined)(this.notificationsList, this.notificationsCenterContainer);
            this._isVisible = true;
            notificationsCenterContainer.classList.add('visible');
            notificationsList.show();
            // Layout
            this.layout(this.workbenchDimensions);
            // Show all notifications that are present now
            notificationsList.updateNotificationsList(0, 0, this.model.notifications);
            // Focus first
            notificationsList.focusFirst();
            // Theming
            this.updateStyles();
            // Mark as visible
            this.model.notifications.forEach(notification => notification.updateVisibility(true));
            // Context Key
            this.notificationsCenterVisibleContextKey.set(true);
            // Event
            this._onDidChangeVisibility.fire();
        }
        updateTitle() {
            const [notificationsCenterTitle, clearAllAction] = (0, types_1.assertAllDefined)(this.notificationsCenterTitle, this.clearAllAction);
            if (this.model.notifications.length === 0) {
                notificationsCenterTitle.textContent = (0, nls_1.localize)('notificationsEmpty', "No new notifications");
                clearAllAction.enabled = false;
            }
            else {
                notificationsCenterTitle.textContent = (0, nls_1.localize)('notifications', "Notifications");
                clearAllAction.enabled = this.model.notifications.some(notification => !notification.hasProgress);
            }
        }
        create() {
            // Container
            this.notificationsCenterContainer = document.createElement('div');
            this.notificationsCenterContainer.classList.add('notifications-center');
            // Header
            this.notificationsCenterHeader = document.createElement('div');
            this.notificationsCenterHeader.classList.add('notifications-center-header');
            this.notificationsCenterContainer.appendChild(this.notificationsCenterHeader);
            // Header Title
            this.notificationsCenterTitle = document.createElement('span');
            this.notificationsCenterTitle.classList.add('notifications-center-header-title');
            this.notificationsCenterHeader.appendChild(this.notificationsCenterTitle);
            // Header Toolbar
            const toolbarContainer = document.createElement('div');
            toolbarContainer.classList.add('notifications-center-header-toolbar');
            this.notificationsCenterHeader.appendChild(toolbarContainer);
            const actionRunner = this._register(this.instantiationService.createInstance(notificationsCommands_1.NotificationActionRunner));
            const notificationsToolBar = this._register(new actionbar_1.ActionBar(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)('notificationsToolbar', "Notification Center Actions"),
                actionRunner
            }));
            this.clearAllAction = this._register(this.instantiationService.createInstance(notificationsActions_1.ClearAllNotificationsAction, notificationsActions_1.ClearAllNotificationsAction.ID, notificationsActions_1.ClearAllNotificationsAction.LABEL));
            notificationsToolBar.push(this.clearAllAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(this.clearAllAction) });
            this.toggleDoNotDisturbAction = this._register(this.instantiationService.createInstance(notificationsActions_1.ToggleDoNotDisturbAction, notificationsActions_1.ToggleDoNotDisturbAction.ID, notificationsActions_1.ToggleDoNotDisturbAction.LABEL));
            notificationsToolBar.push(this.toggleDoNotDisturbAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(this.toggleDoNotDisturbAction) });
            const hideAllAction = this._register(this.instantiationService.createInstance(notificationsActions_1.HideNotificationsCenterAction, notificationsActions_1.HideNotificationsCenterAction.ID, notificationsActions_1.HideNotificationsCenterAction.LABEL));
            notificationsToolBar.push(hideAllAction, { icon: true, label: false, keybinding: this.getKeybindingLabel(hideAllAction) });
            // Notifications List
            this.notificationsList = this.instantiationService.createInstance(notificationsList_1.NotificationsList, this.notificationsCenterContainer, {
                widgetAriaLabel: (0, nls_1.localize)('notificationsCenterWidgetAriaLabel', "Notifications Center")
            });
            this.container.appendChild(this.notificationsCenterContainer);
        }
        getKeybindingLabel(action) {
            const keybinding = this.keybindingService.lookupKeybinding(action.id);
            return keybinding ? keybinding.getLabel() : null;
        }
        onDidChangeNotification(e) {
            if (!this._isVisible) {
                return; // only if visible
            }
            let focusEditor = false;
            // Update notifications list based on event kind
            const [notificationsList, notificationsCenterContainer] = (0, types_1.assertAllDefined)(this.notificationsList, this.notificationsCenterContainer);
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
                    focusEditor = (0, dom_1.isAncestor)(document.activeElement, notificationsCenterContainer);
                    notificationsList.updateNotificationsList(e.index, 1);
                    e.item.updateVisibility(false);
                    break;
            }
            // Update title
            this.updateTitle();
            // Hide if no more notifications to show
            if (this.model.notifications.length === 0) {
                this.hide();
                // Restore focus to editor group if we had focus
                if (focusEditor) {
                    this.editorGroupService.activeGroup.focus();
                }
            }
        }
        hide() {
            if (!this._isVisible || !this.notificationsCenterContainer || !this.notificationsList) {
                return; // already hidden
            }
            const focusEditor = (0, dom_1.isAncestor)(document.activeElement, this.notificationsCenterContainer);
            // Hide
            this._isVisible = false;
            this.notificationsCenterContainer.classList.remove('visible');
            this.notificationsList.hide();
            // Mark as hidden
            this.model.notifications.forEach(notification => notification.updateVisibility(false));
            // Context Key
            this.notificationsCenterVisibleContextKey.set(false);
            // Event
            this._onDidChangeVisibility.fire();
            // Restore focus to editor group if we had focus
            if (focusEditor) {
                this.editorGroupService.activeGroup.focus();
            }
        }
        updateStyles() {
            if (this.notificationsCenterContainer && this.notificationsCenterHeader) {
                const widgetShadowColor = this.getColor(colorRegistry_1.widgetShadow);
                this.notificationsCenterContainer.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
                const borderColor = this.getColor(theme_1.NOTIFICATIONS_CENTER_BORDER);
                this.notificationsCenterContainer.style.border = borderColor ? `1px solid ${borderColor}` : '';
                const headerForeground = this.getColor(theme_1.NOTIFICATIONS_CENTER_HEADER_FOREGROUND);
                this.notificationsCenterHeader.style.color = headerForeground ?? '';
                const headerBackground = this.getColor(theme_1.NOTIFICATIONS_CENTER_HEADER_BACKGROUND);
                this.notificationsCenterHeader.style.background = headerBackground ?? '';
            }
        }
        layout(dimension) {
            this.workbenchDimensions = dimension;
            if (this._isVisible && this.notificationsCenterContainer) {
                const maxWidth = NotificationsCenter_1.MAX_DIMENSIONS.width;
                const maxHeight = NotificationsCenter_1.MAX_DIMENSIONS.height;
                let availableWidth = maxWidth;
                let availableHeight = maxHeight;
                if (this.workbenchDimensions) {
                    // Make sure notifications are not exceding available width
                    availableWidth = this.workbenchDimensions.width;
                    availableWidth -= (2 * 8); // adjust for paddings left and right
                    // Make sure notifications are not exceeding available height
                    availableHeight = this.workbenchDimensions.height - 35 /* header */;
                    if (this.layoutService.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */)) {
                        availableHeight -= 22; // adjust for status bar
                    }
                    if (this.layoutService.isVisible("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */)) {
                        availableHeight -= 22; // adjust for title bar
                    }
                    availableHeight -= (2 * 12); // adjust for paddings top and bottom
                }
                // Apply to list
                const notificationsList = (0, types_1.assertIsDefined)(this.notificationsList);
                notificationsList.layout(Math.min(maxWidth, availableWidth), Math.min(maxHeight, availableHeight));
            }
        }
        clearAll() {
            // Hide notifications center first
            this.hide();
            // Close all
            for (const notification of [...this.model.notifications] /* copy array since we modify it from closing */) {
                if (!notification.hasProgress) {
                    notification.close();
                }
            }
        }
    };
    exports.NotificationsCenter = NotificationsCenter;
    exports.NotificationsCenter = NotificationsCenter = NotificationsCenter_1 = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, notification_1.INotificationService)
    ], NotificationsCenter);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc0NlbnRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uc0NlbnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUJ6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHVCQUFROztpQkFFeEIsbUJBQWMsR0FBRyxJQUFJLGVBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEFBQTFCLENBQTJCO1FBZWpFLFlBQ2tCLFNBQXNCLEVBQ3RCLEtBQTBCLEVBQzVCLFlBQTJCLEVBQ25CLG9CQUE0RCxFQUMxRCxhQUF1RCxFQUM1RCxpQkFBc0QsRUFDcEQsa0JBQXlELEVBQzNELGlCQUFzRCxFQUNwRCxtQkFBMEQ7WUFFaEYsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBVkgsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUN0QixVQUFLLEdBQUwsS0FBSyxDQUFxQjtZQUVILHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDekMsa0JBQWEsR0FBYixhQUFhLENBQXlCO1lBQzNDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbkMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFzQjtZQUMxQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ25DLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUF0QmhFLDJCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3JFLDBCQUFxQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFRbEQseUNBQW9DLEdBQUcsK0NBQWlDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxD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