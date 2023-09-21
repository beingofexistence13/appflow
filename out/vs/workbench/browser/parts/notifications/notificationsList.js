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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/platform/list/browser/listService", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/theme", "vs/workbench/browser/parts/notifications/notificationsViewer", "vs/workbench/browser/parts/notifications/notificationsActions", "vs/platform/contextview/browser/contextView", "vs/base/common/types", "vs/workbench/common/contextkeys", "vs/base/common/lifecycle", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/platform/keybinding/common/keybinding", "vs/platform/configuration/common/configuration", "vs/css!./media/notificationsList"], function (require, exports, nls_1, dom_1, listService_1, instantiation_1, theme_1, notificationsViewer_1, notificationsActions_1, contextView_1, types_1, contextkeys_1, lifecycle_1, notificationsCommands_1, keybinding_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationsList = void 0;
    let NotificationsList = class NotificationsList extends lifecycle_1.Disposable {
        constructor(container, options, instantiationService, contextMenuService) {
            super();
            this.container = container;
            this.options = options;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.viewModel = [];
        }
        show() {
            if (this.isVisible) {
                return; // already visible
            }
            // Lazily create if showing for the first time
            if (!this.list) {
                this.createNotificationsList();
            }
            // Make visible
            this.isVisible = true;
        }
        createNotificationsList() {
            // List Container
            this.listContainer = document.createElement('div');
            this.listContainer.classList.add('notifications-list-container');
            const actionRunner = this._register(this.instantiationService.createInstance(notificationsCommands_1.NotificationActionRunner));
            // Notification Renderer
            const renderer = this.instantiationService.createInstance(notificationsViewer_1.NotificationRenderer, actionRunner);
            // List
            const listDelegate = this.listDelegate = new notificationsViewer_1.NotificationsListDelegate(this.listContainer);
            const options = this.options;
            const list = this.list = this._register(this.instantiationService.createInstance(listService_1.WorkbenchList, 'NotificationsList', this.listContainer, listDelegate, [renderer], {
                ...options,
                setRowLineHeight: false,
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: theme_1.NOTIFICATIONS_BACKGROUND
                },
                accessibilityProvider: this.instantiationService.createInstance(NotificationAccessibilityProvider, options)
            }));
            // Context menu to copy message
            const copyAction = this._register(this.instantiationService.createInstance(notificationsActions_1.CopyNotificationMessageAction, notificationsActions_1.CopyNotificationMessageAction.ID, notificationsActions_1.CopyNotificationMessageAction.LABEL));
            this._register((list.onContextMenu(e => {
                if (!e.element) {
                    return;
                }
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => [copyAction],
                    getActionsContext: () => e.element,
                    actionRunner
                });
            })));
            // Toggle on double click
            this._register((list.onMouseDblClick(event => event.element.toggle())));
            // Clear focus when DOM focus moves out
            // Use document.hasFocus() to not clear the focus when the entire window lost focus
            // This ensures that when the focus comes back, the notification is still focused
            const listFocusTracker = this._register((0, dom_1.trackFocus)(list.getHTMLElement()));
            this._register(listFocusTracker.onDidBlur(() => {
                if (document.hasFocus()) {
                    list.setFocus([]);
                }
            }));
            // Context key
            contextkeys_1.NotificationFocusedContext.bindTo(list.contextKeyService);
            // Only allow for focus in notifications, as the
            // selection is too strong over the contents of
            // the notification
            this._register(list.onDidChangeSelection(e => {
                if (e.indexes.length > 0) {
                    list.setSelection([]);
                }
            }));
            this.container.appendChild(this.listContainer);
        }
        updateNotificationsList(start, deleteCount, items = []) {
            const [list, listContainer] = (0, types_1.assertAllDefined)(this.list, this.listContainer);
            const listHasDOMFocus = (0, dom_1.isAncestor)(document.activeElement, listContainer);
            // Remember focus and relative top of that item
            const focusedIndex = list.getFocus()[0];
            const focusedItem = this.viewModel[focusedIndex];
            let focusRelativeTop = null;
            if (typeof focusedIndex === 'number') {
                focusRelativeTop = list.getRelativeTop(focusedIndex);
            }
            // Update view model
            this.viewModel.splice(start, deleteCount, ...items);
            // Update list
            list.splice(start, deleteCount, items);
            list.layout();
            // Hide if no more notifications to show
            if (this.viewModel.length === 0) {
                this.hide();
            }
            // Otherwise restore focus if we had
            else if (typeof focusedIndex === 'number') {
                let indexToFocus = 0;
                if (focusedItem) {
                    let indexToFocusCandidate = this.viewModel.indexOf(focusedItem);
                    if (indexToFocusCandidate === -1) {
                        indexToFocusCandidate = focusedIndex - 1; // item could have been removed
                    }
                    if (indexToFocusCandidate < this.viewModel.length && indexToFocusCandidate >= 0) {
                        indexToFocus = indexToFocusCandidate;
                    }
                }
                if (typeof focusRelativeTop === 'number') {
                    list.reveal(indexToFocus, focusRelativeTop);
                }
                list.setFocus([indexToFocus]);
            }
            // Restore DOM focus if we had focus before
            if (this.isVisible && listHasDOMFocus) {
                list.domFocus();
            }
        }
        updateNotificationHeight(item) {
            const index = this.viewModel.indexOf(item);
            if (index === -1) {
                return;
            }
            const [list, listDelegate] = (0, types_1.assertAllDefined)(this.list, this.listDelegate);
            list.updateElementHeight(index, listDelegate.getHeight(item));
            list.layout();
        }
        hide() {
            if (!this.isVisible || !this.list) {
                return; // already hidden
            }
            // Hide
            this.isVisible = false;
            // Clear list
            this.list.splice(0, this.viewModel.length);
            // Clear view model
            this.viewModel = [];
        }
        focusFirst() {
            if (!this.list) {
                return; // not created yet
            }
            this.list.focusFirst();
            this.list.domFocus();
        }
        hasFocus() {
            if (!this.listContainer) {
                return false; // not created yet
            }
            return (0, dom_1.isAncestor)(document.activeElement, this.listContainer);
        }
        layout(width, maxHeight) {
            if (this.listContainer && this.list) {
                this.listContainer.style.width = `${width}px`;
                if (typeof maxHeight === 'number') {
                    this.list.getHTMLElement().style.maxHeight = `${maxHeight}px`;
                }
                this.list.layout();
            }
        }
        dispose() {
            this.hide();
            super.dispose();
        }
    };
    exports.NotificationsList = NotificationsList;
    exports.NotificationsList = NotificationsList = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextView_1.IContextMenuService)
    ], NotificationsList);
    let NotificationAccessibilityProvider = class NotificationAccessibilityProvider {
        constructor(_options, _keybindingService, _configurationService) {
            this._options = _options;
            this._keybindingService = _keybindingService;
            this._configurationService = _configurationService;
        }
        getAriaLabel(element) {
            let accessibleViewHint;
            const keybinding = this._keybindingService.lookupKeybinding('editor.action.accessibleView')?.getAriaLabel();
            if (this._configurationService.getValue('accessibility.verbosity.notification')) {
                accessibleViewHint = keybinding ? (0, nls_1.localize)('notificationAccessibleViewHint', "Inspect the response in the accessible view with {0}", keybinding) : (0, nls_1.localize)('notificationAccessibleViewHintNoKb', "Inspect the response in the accessible view via the command Open Accessible View which is currently not triggerable via keybinding");
            }
            if (!element.source) {
                return accessibleViewHint ? (0, nls_1.localize)('notificationAriaLabelHint', "{0}, notification, {1}", element.message.raw, accessibleViewHint) : (0, nls_1.localize)('notificationAriaLabel', "{0}, notification", element.message.raw);
            }
            return accessibleViewHint ? (0, nls_1.localize)('notificationWithSourceAriaLabelHint', "{0}, source: {1}, notification, {2}", element.message.raw, element.source, accessibleViewHint) : (0, nls_1.localize)('notificationWithSourceAriaLabel', "{0}, source: {1}, notification", element.message.raw, element.source);
        }
        getWidgetAriaLabel() {
            return this._options.widgetAriaLabel ?? (0, nls_1.localize)('notificationsList', "Notifications List");
        }
        getRole() {
            return 'dialog'; // https://github.com/microsoft/vscode/issues/82728
        }
    };
    NotificationAccessibilityProvider = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, configuration_1.IConfigurationService)
    ], NotificationAccessibilityProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc0xpc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9ub3RpZmljYXRpb25zL25vdGlmaWNhdGlvbnNMaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCekYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxzQkFBVTtRQVFoRCxZQUNrQixTQUFzQixFQUN0QixPQUFrQyxFQUM1QixvQkFBNEQsRUFDOUQsa0JBQXdEO1lBRTdFLEtBQUssRUFBRSxDQUFDO1lBTFMsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUN0QixZQUFPLEdBQVAsT0FBTyxDQUEyQjtZQUNYLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDN0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQVB0RSxjQUFTLEdBQTRCLEVBQUUsQ0FBQztRQVVoRCxDQUFDO1FBRUQsSUFBSTtZQUNILElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsT0FBTyxDQUFDLGtCQUFrQjthQUMxQjtZQUVELDhDQUE4QztZQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDZixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQzthQUMvQjtZQUVELGVBQWU7WUFDZixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN2QixDQUFDO1FBRU8sdUJBQXVCO1lBRTlCLGlCQUFpQjtZQUNqQixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFFakUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJ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