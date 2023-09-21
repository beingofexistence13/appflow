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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/nls", "vs/base/browser/ui/button/button", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/workbench/common/notifications", "vs/workbench/browser/parts/notifications/notificationsActions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/progressbar/progressbar", "vs/platform/notification/common/notification", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/browser/event", "vs/base/browser/touch", "vs/base/common/event", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/keyboardEvent"], function (require, exports, dom_1, opener_1, uri_1, nls_1, button_1, actionbar_1, actions_1, instantiation_1, lifecycle_1, contextView_1, notifications_1, notificationsActions_1, keybinding_1, progressbar_1, notification_1, arrays_1, codicons_1, themables_1, dropdownActionViewItem_1, event_1, touch_1, event_2, defaultStyles_1, keyboardEvent_1) {
    "use strict";
    var NotificationRenderer_1, NotificationTemplateRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationTemplateRenderer = exports.NotificationRenderer = exports.NotificationsListDelegate = void 0;
    class NotificationsListDelegate {
        static { this.ROW_HEIGHT = 42; }
        static { this.LINE_HEIGHT = 22; }
        constructor(container) {
            this.offsetHelper = this.createOffsetHelper(container);
        }
        createOffsetHelper(container) {
            const offsetHelper = document.createElement('div');
            offsetHelper.classList.add('notification-offset-helper');
            container.appendChild(offsetHelper);
            return offsetHelper;
        }
        getHeight(notification) {
            if (!notification.expanded) {
                return NotificationsListDelegate.ROW_HEIGHT; // return early if there are no more rows to show
            }
            // First row: message and actions
            let expandedHeight = NotificationsListDelegate.ROW_HEIGHT;
            // Dynamic height: if message overflows
            const preferredMessageHeight = this.computePreferredHeight(notification);
            const messageOverflows = NotificationsListDelegate.LINE_HEIGHT < preferredMessageHeight;
            if (messageOverflows) {
                const overflow = preferredMessageHeight - NotificationsListDelegate.LINE_HEIGHT;
                expandedHeight += overflow;
            }
            // Last row: source and buttons if we have any
            if (notification.source || (0, arrays_1.isNonEmptyArray)(notification.actions && notification.actions.primary)) {
                expandedHeight += NotificationsListDelegate.ROW_HEIGHT;
            }
            // If the expanded height is same as collapsed, unset the expanded state
            // but skip events because there is no change that has visual impact
            if (expandedHeight === NotificationsListDelegate.ROW_HEIGHT) {
                notification.collapse(true /* skip events, no change in height */);
            }
            return expandedHeight;
        }
        computePreferredHeight(notification) {
            // Prepare offset helper depending on toolbar actions count
            let actions = 0;
            if (!notification.hasProgress) {
                actions++; // close
            }
            if (notification.canCollapse) {
                actions++; // expand/collapse
            }
            if ((0, arrays_1.isNonEmptyArray)(notification.actions && notification.actions.secondary)) {
                actions++; // secondary actions
            }
            this.offsetHelper.style.width = `${450 /* notifications container width */ - (10 /* padding */ + 30 /* severity icon */ + (actions * 30) /* actions */ - (Math.max(actions - 1, 0) * 4) /* less padding for actions > 1 */)}px`;
            // Render message into offset helper
            const renderedMessage = NotificationMessageRenderer.render(notification.message);
            this.offsetHelper.appendChild(renderedMessage);
            // Compute height
            const preferredHeight = Math.max(this.offsetHelper.offsetHeight, this.offsetHelper.scrollHeight);
            // Always clear offset helper after use
            (0, dom_1.clearNode)(this.offsetHelper);
            return preferredHeight;
        }
        getTemplateId(element) {
            if (element instanceof notifications_1.NotificationViewItem) {
                return NotificationRenderer.TEMPLATE_ID;
            }
            throw new Error('unknown element type: ' + element);
        }
    }
    exports.NotificationsListDelegate = NotificationsListDelegate;
    class NotificationMessageRenderer {
        static render(message, actionHandler) {
            const messageContainer = document.createElement('span');
            for (const node of message.linkedText.nodes) {
                if (typeof node === 'string') {
                    messageContainer.appendChild(document.createTextNode(node));
                }
                else {
                    let title = node.title;
                    if (!title && node.href.startsWith('command:')) {
                        title = (0, nls_1.localize)('executeCommand', "Click to execute command '{0}'", node.href.substr('command:'.length));
                    }
                    else if (!title) {
                        title = node.href;
                    }
                    const anchor = (0, dom_1.$)('a', { href: node.href, title, tabIndex: 0 }, node.label);
                    if (actionHandler) {
                        const handleOpen = (e) => {
                            if ((0, dom_1.isEventLike)(e)) {
                                dom_1.EventHelper.stop(e, true);
                            }
                            actionHandler.callback(node.href);
                        };
                        const onClick = actionHandler.toDispose.add(new event_1.DomEmitter(anchor, dom_1.EventType.CLICK)).event;
                        const onKeydown = actionHandler.toDispose.add(new event_1.DomEmitter(anchor, dom_1.EventType.KEY_DOWN)).event;
                        const onSpaceOrEnter = event_2.Event.chain(onKeydown, $ => $.filter(e => {
                            const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                            return event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */);
                        }));
                        actionHandler.toDispose.add(touch_1.Gesture.addTarget(anchor));
                        const onTap = actionHandler.toDispose.add(new event_1.DomEmitter(anchor, touch_1.EventType.Tap)).event;
                        event_2.Event.any(onClick, onTap, onSpaceOrEnter)(handleOpen, null, actionHandler.toDispose);
                    }
                    messageContainer.appendChild(anchor);
                }
            }
            return messageContainer;
        }
    }
    let NotificationRenderer = class NotificationRenderer {
        static { NotificationRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'notification'; }
        constructor(actionRunner, contextMenuService, instantiationService) {
            this.actionRunner = actionRunner;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
        }
        get templateId() {
            return NotificationRenderer_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = new lifecycle_1.DisposableStore();
            // Container
            data.container = document.createElement('div');
            data.container.classList.add('notification-list-item');
            // Main Row
            data.mainRow = document.createElement('div');
            data.mainRow.classList.add('notification-list-item-main-row');
            // Icon
            data.icon = document.createElement('div');
            data.icon.classList.add('notification-list-item-icon', 'codicon');
            // Message
            data.message = document.createElement('div');
            data.message.classList.add('notification-list-item-message');
            // Toolbar
            const toolbarContainer = document.createElement('div');
            toolbarContainer.classList.add('notification-list-item-toolbar-container');
            data.toolbar = new actionbar_1.ActionBar(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)('notificationActions', "Notification Actions"),
                actionViewItemProvider: action => {
                    if (action && action instanceof notificationsActions_1.ConfigureNotificationAction) {
                        const item = new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, action.configurationActions, this.contextMenuService, { actionRunner: this.actionRunner, classNames: action.class });
                        data.toDispose.add(item);
                        return item;
                    }
                    return undefined;
                },
                actionRunner: this.actionRunner
            });
            data.toDispose.add(data.toolbar);
            // Details Row
            data.detailsRow = document.createElement('div');
            data.detailsRow.classList.add('notification-list-item-details-row');
            // Source
            data.source = document.createElement('div');
            data.source.classList.add('notification-list-item-source');
            // Buttons Container
            data.buttonsContainer = document.createElement('div');
            data.buttonsContainer.classList.add('notification-list-item-buttons-container');
            container.appendChild(data.container);
            // the details row appears first in order for better keyboard access to notification buttons
            data.container.appendChild(data.detailsRow);
            data.detailsRow.appendChild(data.source);
            data.detailsRow.appendChild(data.buttonsContainer);
            // main row
            data.container.appendChild(data.mainRow);
            data.mainRow.appendChild(data.icon);
            data.mainRow.appendChild(data.message);
            data.mainRow.appendChild(toolbarContainer);
            // Progress: below the rows to span the entire width of the item
            data.progress = new progressbar_1.ProgressBar(container, defaultStyles_1.defaultProgressBarStyles);
            data.toDispose.add(data.progress);
            // Renderer
            data.renderer = this.instantiationService.createInstance(NotificationTemplateRenderer, data, this.actionRunner);
            data.toDispose.add(data.renderer);
            return data;
        }
        renderElement(notification, index, data) {
            data.renderer.setInput(notification);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    exports.NotificationRenderer = NotificationRenderer;
    exports.NotificationRenderer = NotificationRenderer = NotificationRenderer_1 = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, instantiation_1.IInstantiationService)
    ], NotificationRenderer);
    let NotificationTemplateRenderer = class NotificationTemplateRenderer extends lifecycle_1.Disposable {
        static { NotificationTemplateRenderer_1 = this; }
        static { this.SEVERITIES = [notification_1.Severity.Info, notification_1.Severity.Warning, notification_1.Severity.Error]; }
        constructor(template, actionRunner, openerService, instantiationService, keybindingService, contextMenuService) {
            super();
            this.template = template;
            this.actionRunner = actionRunner;
            this.openerService = openerService;
            this.instantiationService = instantiationService;
            this.keybindingService = keybindingService;
            this.contextMenuService = contextMenuService;
            this.inputDisposables = this._register(new lifecycle_1.DisposableStore());
            if (!NotificationTemplateRenderer_1.closeNotificationAction) {
                NotificationTemplateRenderer_1.closeNotificationAction = instantiationService.createInstance(notificationsActions_1.ClearNotificationAction, notificationsActions_1.ClearNotificationAction.ID, notificationsActions_1.ClearNotificationAction.LABEL);
                NotificationTemplateRenderer_1.expandNotificationAction = instantiationService.createInstance(notificationsActions_1.ExpandNotificationAction, notificationsActions_1.ExpandNotificationAction.ID, notificationsActions_1.ExpandNotificationAction.LABEL);
                NotificationTemplateRenderer_1.collapseNotificationAction = instantiationService.createInstance(notificationsActions_1.CollapseNotificationAction, notificationsActions_1.CollapseNotificationAction.ID, notificationsActions_1.CollapseNotificationAction.LABEL);
            }
        }
        setInput(notification) {
            this.inputDisposables.clear();
            this.render(notification);
        }
        render(notification) {
            // Container
            this.template.container.classList.toggle('expanded', notification.expanded);
            this.inputDisposables.add((0, dom_1.addDisposableListener)(this.template.container, dom_1.EventType.MOUSE_UP, e => {
                if (e.button === 1 /* Middle Button */) {
                    // Prevent firing the 'paste' event in the editor textarea - #109322
                    dom_1.EventHelper.stop(e, true);
                }
            }));
            this.inputDisposables.add((0, dom_1.addDisposableListener)(this.template.container, dom_1.EventType.AUXCLICK, e => {
                if (!notification.hasProgress && e.button === 1 /* Middle Button */) {
                    dom_1.EventHelper.stop(e, true);
                    notification.close();
                }
            }));
            // Severity Icon
            this.renderSeverity(notification);
            // Message
            const messageOverflows = this.renderMessage(notification);
            // Secondary Actions
            this.renderSecondaryActions(notification, messageOverflows);
            // Source
            this.renderSource(notification);
            // Buttons
            this.renderButtons(notification);
            // Progress
            this.renderProgress(notification);
            // Label Change Events that we can handle directly
            // (changes to actions require an entire redraw of
            // the notification because it has an impact on
            // epxansion state)
            this.inputDisposables.add(notification.onDidChangeContent(event => {
                switch (event.kind) {
                    case 0 /* NotificationViewItemContentChangeKind.SEVERITY */:
                        this.renderSeverity(notification);
                        break;
                    case 3 /* NotificationViewItemContentChangeKind.PROGRESS */:
                        this.renderProgress(notification);
                        break;
                    case 1 /* NotificationViewItemContentChangeKind.MESSAGE */:
                        this.renderMessage(notification);
                        break;
                }
            }));
        }
        renderSeverity(notification) {
            // first remove, then set as the codicon class names overlap
            NotificationTemplateRenderer_1.SEVERITIES.forEach(severity => {
                if (notification.severity !== severity) {
                    this.template.icon.classList.remove(...themables_1.ThemeIcon.asClassNameArray(this.toSeverityIcon(severity)));
                }
            });
            this.template.icon.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.toSeverityIcon(notification.severity)));
        }
        renderMessage(notification) {
            (0, dom_1.clearNode)(this.template.message);
            this.template.message.appendChild(NotificationMessageRenderer.render(notification.message, {
                callback: link => this.openerService.open(uri_1.URI.parse(link), { allowCommands: true }),
                toDispose: this.inputDisposables
            }));
            const messageOverflows = notification.canCollapse && !notification.expanded && this.template.message.scrollWidth > this.template.message.clientWidth;
            if (messageOverflows) {
                this.template.message.title = this.template.message.textContent + '';
            }
            else {
                this.template.message.removeAttribute('title');
            }
            return messageOverflows;
        }
        renderSecondaryActions(notification, messageOverflows) {
            const actions = [];
            // Secondary Actions
            const secondaryActions = notification.actions ? notification.actions.secondary : undefined;
            if ((0, arrays_1.isNonEmptyArray)(secondaryActions)) {
                const configureNotificationAction = this.instantiationService.createInstance(notificationsActions_1.ConfigureNotificationAction, notificationsActions_1.ConfigureNotificationAction.ID, notificationsActions_1.ConfigureNotificationAction.LABEL, secondaryActions);
                actions.push(configureNotificationAction);
                this.inputDisposables.add(configureNotificationAction);
            }
            // Expand / Collapse
            let showExpandCollapseAction = false;
            if (notification.canCollapse) {
                if (notification.expanded) {
                    showExpandCollapseAction = true; // allow to collapse an expanded message
                }
                else if (notification.source) {
                    showExpandCollapseAction = true; // allow to expand to details row
                }
                else if (messageOverflows) {
                    showExpandCollapseAction = true; // allow to expand if message overflows
                }
            }
            if (showExpandCollapseAction) {
                actions.push(notification.expanded ? NotificationTemplateRenderer_1.collapseNotificationAction : NotificationTemplateRenderer_1.expandNotificationAction);
            }
            // Close (unless progress is showing)
            if (!notification.hasProgress) {
                actions.push(NotificationTemplateRenderer_1.closeNotificationAction);
            }
            this.template.toolbar.clear();
            this.template.toolbar.context = notification;
            actions.forEach(action => this.template.toolbar.push(action, { icon: true, label: false, keybinding: this.getKeybindingLabel(action) }));
        }
        renderSource(notification) {
            if (notification.expanded && notification.source) {
                this.template.source.textContent = (0, nls_1.localize)('notificationSource', "Source: {0}", notification.source);
                this.template.source.title = notification.source;
            }
            else {
                this.template.source.textContent = '';
                this.template.source.removeAttribute('title');
            }
        }
        renderButtons(notification) {
            (0, dom_1.clearNode)(this.template.buttonsContainer);
            const primaryActions = notification.actions ? notification.actions.primary : undefined;
            if (notification.expanded && (0, arrays_1.isNonEmptyArray)(primaryActions)) {
                const that = this;
                const actionRunner = new class extends actions_1.ActionRunner {
                    async runAction(action) {
                        // Run action
                        that.actionRunner.run(action, notification);
                        // Hide notification (unless explicitly prevented)
                        if (!(action instanceof notifications_1.ChoiceAction) || !action.keepOpen) {
                            notification.close();
                        }
                    }
                }();
                const buttonToolbar = this.inputDisposables.add(new button_1.ButtonBar(this.template.buttonsContainer));
                for (let i = 0; i < primaryActions.length; i++) {
                    const action = primaryActions[i];
                    const options = {
                        title: true,
                        secondary: i > 0,
                        ...defaultStyles_1.defaultButtonStyles
                    };
                    const dropdownActions = action instanceof notifications_1.ChoiceAction ? action.menu : undefined;
                    const button = this.inputDisposables.add(dropdownActions ?
                        buttonToolbar.addButtonWithDropdown({
                            ...options,
                            contextMenuProvider: this.contextMenuService,
                            actions: dropdownActions,
                            actionRunner
                        }) :
                        buttonToolbar.addButton(options));
                    button.label = action.label;
                    this.inputDisposables.add(button.onDidClick(e => {
                        if (e) {
                            dom_1.EventHelper.stop(e, true);
                        }
                        actionRunner.run(action);
                    }));
                }
            }
        }
        renderProgress(notification) {
            // Return early if the item has no progress
            if (!notification.hasProgress) {
                this.template.progress.stop().hide();
                return;
            }
            // Infinite
            const state = notification.progress.state;
            if (state.infinite) {
                this.template.progress.infinite().show();
            }
            // Total / Worked
            else if (typeof state.total === 'number' || typeof state.worked === 'number') {
                if (typeof state.total === 'number' && !this.template.progress.hasTotal()) {
                    this.template.progress.total(state.total);
                }
                if (typeof state.worked === 'number') {
                    this.template.progress.setWorked(state.worked).show();
                }
            }
            // Done
            else {
                this.template.progress.done().hide();
            }
        }
        toSeverityIcon(severity) {
            switch (severity) {
                case notification_1.Severity.Warning:
                    return codicons_1.Codicon.warning;
                case notification_1.Severity.Error:
                    return codicons_1.Codicon.error;
            }
            return codicons_1.Codicon.info;
        }
        getKeybindingLabel(action) {
            const keybinding = this.keybindingService.lookupKeybinding(action.id);
            return keybinding ? keybinding.getLabel() : null;
        }
    };
    exports.NotificationTemplateRenderer = NotificationTemplateRenderer;
    exports.NotificationTemplateRenderer = NotificationTemplateRenderer = NotificationTemplateRenderer_1 = __decorate([
        __param(2, opener_1.IOpenerService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, contextView_1.IContextMenuService)
    ], NotificationTemplateRenderer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uc1ZpZXdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL25vdGlmaWNhdGlvbnMvbm90aWZpY2F0aW9uc1ZpZXdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBNkJoRyxNQUFhLHlCQUF5QjtpQkFFYixlQUFVLEdBQUcsRUFBRSxDQUFDO2lCQUNoQixnQkFBVyxHQUFHLEVBQUUsQ0FBQztRQUl6QyxZQUFZLFNBQXNCO1lBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxTQUFzQjtZQUNoRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25ELFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFFekQsU0FBUyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwQyxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBRUQsU0FBUyxDQUFDLFlBQW1DO1lBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFO2dCQUMzQixPQUFPLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFDLGlEQUFpRDthQUM5RjtZQUVELGlDQUFpQztZQUNqQyxJQUFJLGNBQWMsR0FBRyx5QkFBeUIsQ0FBQyxVQUFVLENBQUM7WUFFMUQsdUNBQXVDO1lBQ3ZDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sZ0JBQWdCLEdBQUcseUJBQXlCLENBQUMsV0FBVyxHQUFHLHNCQUFzQixDQUFDO1lBQ3hGLElBQUksZ0JBQWdC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