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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/nls!vs/workbench/browser/parts/notifications/notificationsViewer", "vs/base/browser/ui/button/button", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/workbench/common/notifications", "vs/workbench/browser/parts/notifications/notificationsActions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/progressbar/progressbar", "vs/platform/notification/common/notification", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/browser/event", "vs/base/browser/touch", "vs/base/common/event", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/keyboardEvent"], function (require, exports, dom_1, opener_1, uri_1, nls_1, button_1, actionbar_1, actions_1, instantiation_1, lifecycle_1, contextView_1, notifications_1, notificationsActions_1, keybinding_1, progressbar_1, notification_1, arrays_1, codicons_1, themables_1, dropdownActionViewItem_1, event_1, touch_1, event_2, defaultStyles_1, keyboardEvent_1) {
    "use strict";
    var $01b_1, $$1b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$1b = exports.$01b = exports.$91b = void 0;
    class $91b {
        static { this.a = 42; }
        static { this.b = 22; }
        constructor(container) {
            this.c = this.d(container);
        }
        d(container) {
            const offsetHelper = document.createElement('div');
            offsetHelper.classList.add('notification-offset-helper');
            container.appendChild(offsetHelper);
            return offsetHelper;
        }
        getHeight(notification) {
            if (!notification.expanded) {
                return $91b.a; // return early if there are no more rows to show
            }
            // First row: message and actions
            let expandedHeight = $91b.a;
            // Dynamic height: if message overflows
            const preferredMessageHeight = this.f(notification);
            const messageOverflows = $91b.b < preferredMessageHeight;
            if (messageOverflows) {
                const overflow = preferredMessageHeight - $91b.b;
                expandedHeight += overflow;
            }
            // Last row: source and buttons if we have any
            if (notification.source || (0, arrays_1.$Jb)(notification.actions && notification.actions.primary)) {
                expandedHeight += $91b.a;
            }
            // If the expanded height is same as collapsed, unset the expanded state
            // but skip events because there is no change that has visual impact
            if (expandedHeight === $91b.a) {
                notification.collapse(true /* skip events, no change in height */);
            }
            return expandedHeight;
        }
        f(notification) {
            // Prepare offset helper depending on toolbar actions count
            let actions = 0;
            if (!notification.hasProgress) {
                actions++; // close
            }
            if (notification.canCollapse) {
                actions++; // expand/collapse
            }
            if ((0, arrays_1.$Jb)(notification.actions && notification.actions.secondary)) {
                actions++; // secondary actions
            }
            this.c.style.width = `${450 /* notifications container width */ - (10 /* padding */ + 30 /* severity icon */ + (actions * 30) /* actions */ - (Math.max(actions - 1, 0) * 4) /* less padding for actions > 1 */)}px`;
            // Render message into offset helper
            const renderedMessage = NotificationMessageRenderer.render(notification.message);
            this.c.appendChild(renderedMessage);
            // Compute height
            const preferredHeight = Math.max(this.c.offsetHeight, this.c.scrollHeight);
            // Always clear offset helper after use
            (0, dom_1.$lO)(this.c);
            return preferredHeight;
        }
        getTemplateId(element) {
            if (element instanceof notifications_1.$Ozb) {
                return $01b.TEMPLATE_ID;
            }
            throw new Error('unknown element type: ' + element);
        }
    }
    exports.$91b = $91b;
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
                        title = (0, nls_1.localize)(0, null, node.href.substr('command:'.length));
                    }
                    else if (!title) {
                        title = node.href;
                    }
                    const anchor = (0, dom_1.$)('a', { href: node.href, title, tabIndex: 0 }, node.label);
                    if (actionHandler) {
                        const handleOpen = (e) => {
                            if ((0, dom_1.$4O)(e)) {
                                dom_1.$5O.stop(e, true);
                            }
                            actionHandler.callback(node.href);
                        };
                        const onClick = actionHandler.toDispose.add(new event_1.$9P(anchor, dom_1.$3O.CLICK)).event;
                        const onKeydown = actionHandler.toDispose.add(new event_1.$9P(anchor, dom_1.$3O.KEY_DOWN)).event;
                        const onSpaceOrEnter = event_2.Event.chain(onKeydown, $ => $.filter(e => {
                            const event = new keyboardEvent_1.$jO(e);
                            return event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */);
                        }));
                        actionHandler.toDispose.add(touch_1.$EP.addTarget(anchor));
                        const onTap = actionHandler.toDispose.add(new event_1.$9P(anchor, touch_1.EventType.Tap)).event;
                        event_2.Event.any(onClick, onTap, onSpaceOrEnter)(handleOpen, null, actionHandler.toDispose);
                    }
                    messageContainer.appendChild(anchor);
                }
            }
            return messageContainer;
        }
    }
    let $01b = class $01b {
        static { $01b_1 = this; }
        static { this.TEMPLATE_ID = 'notification'; }
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        get templateId() {
            return $01b_1.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDispose = new lifecycle_1.$jc();
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
            data.toolbar = new actionbar_1.$1P(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)(1, null),
                actionViewItemProvider: action => {
                    if (action && action instanceof notificationsActions_1.$71b) {
                        const item = new dropdownActionViewItem_1.$CR(action, action.configurationActions, this.b, { actionRunner: this.a, classNames: action.class });
                        data.toDispose.add(item);
                        return item;
                    }
                    return undefined;
                },
                actionRunner: this.a
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
            data.progress = new progressbar_1.$YR(container, defaultStyles_1.$k2);
            data.toDispose.add(data.progress);
            // Renderer
            data.renderer = this.c.createInstance($$1b, data, this.a);
            data.toDispose.add(data.renderer);
            return data;
        }
        renderElement(notification, index, data) {
            data.renderer.setInput(notification);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.$fc)(templateData.toDispose);
        }
    };
    exports.$01b = $01b;
    exports.$01b = $01b = $01b_1 = __decorate([
        __param(1, contextView_1.$WZ),
        __param(2, instantiation_1.$Ah)
    ], $01b);
    let $$1b = class $$1b extends lifecycle_1.$kc {
        static { $$1b_1 = this; }
        static { this.f = [notification_1.Severity.Info, notification_1.Severity.Warning, notification_1.Severity.Error]; }
        constructor(h, j, m, n, r, s) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.g = this.B(new lifecycle_1.$jc());
            if (!$$1b_1.a) {
                $$1b_1.a = n.createInstance(notificationsActions_1.$11b, notificationsActions_1.$11b.ID, notificationsActions_1.$11b.LABEL);
                $$1b_1.b = n.createInstance(notificationsActions_1.$51b, notificationsActions_1.$51b.ID, notificationsActions_1.$51b.LABEL);
                $$1b_1.c = n.createInstance(notificationsActions_1.$61b, notificationsActions_1.$61b.ID, notificationsActions_1.$61b.LABEL);
            }
        }
        setInput(notification) {
            this.g.clear();
            this.t(notification);
        }
        t(notification) {
            // Container
            this.h.container.classList.toggle('expanded', notification.expanded);
            this.g.add((0, dom_1.$nO)(this.h.container, dom_1.$3O.MOUSE_UP, e => {
                if (e.button === 1 /* Middle Button */) {
                    // Prevent firing the 'paste' event in the editor textarea - #109322
                    dom_1.$5O.stop(e, true);
                }
            }));
            this.g.add((0, dom_1.$nO)(this.h.container, dom_1.$3O.AUXCLICK, e => {
                if (!notification.hasProgress && e.button === 1 /* Middle Button */) {
                    dom_1.$5O.stop(e, true);
                    notification.close();
                }
            }));
            // Severity Icon
            this.u(notification);
            // Message
            const messageOverflows = this.w(notification);
            // Secondary Actions
            this.y(notification, messageOverflows);
            // Source
            this.z(notification);
            // Buttons
            this.C(notification);
            // Progress
            this.D(notification);
            // Label Change Events that we can handle directly
            // (changes to actions require an entire redraw of
            // the notification because it has an impact on
            // epxansion state)
            this.g.add(notification.onDidChangeContent(event => {
                switch (event.kind) {
                    case 0 /* NotificationViewItemContentChangeKind.SEVERITY */:
                        this.u(notification);
                        break;
                    case 3 /* NotificationViewItemContentChangeKind.PROGRESS */:
                        this.D(notification);
                        break;
                    case 1 /* NotificationViewItemContentChangeKind.MESSAGE */:
                        this.w(notification);
                        break;
                }
            }));
        }
        u(notification) {
            // first remove, then set as the codicon class names overlap
            $$1b_1.f.forEach(severity => {
                if (notification.severity !== severity) {
                    this.h.icon.classList.remove(...themables_1.ThemeIcon.asClassNameArray(this.F(severity)));
                }
            });
            this.h.icon.classList.add(...themables_1.ThemeIcon.asClassNameArray(this.F(notification.severity)));
        }
        w(notification) {
            (0, dom_1.$lO)(this.h.message);
            this.h.message.appendChild(NotificationMessageRenderer.render(notification.message, {
                callback: link => this.m.open(uri_1.URI.parse(link), { allowCommands: true }),
                toDispose: this.g
            }));
            const messageOverflows = notification.canCollapse && !notification.expanded && this.h.message.scrollWidth > this.h.message.clientWidth;
            if (messageOverflows) {
                this.h.message.title = this.h.message.textContent + '';
            }
            else {
                this.h.message.removeAttribute('title');
            }
            return messageOverflows;
        }
        y(notification, messageOverflows) {
            const actions = [];
            // Secondary Actions
            const secondaryActions = notification.actions ? notification.actions.secondary : undefined;
            if ((0, arrays_1.$Jb)(secondaryActions)) {
                const configureNotificationAction = this.n.createInstance(notificationsActions_1.$71b, notificationsActions_1.$71b.ID, notificationsActions_1.$71b.LABEL, secondaryActions);
                actions.push(configureNotificationAction);
                this.g.add(configureNotificationAction);
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
                actions.push(notification.expanded ? $$1b_1.c : $$1b_1.b);
            }
            // Close (unless progress is showing)
            if (!notification.hasProgress) {
                actions.push($$1b_1.a);
            }
            this.h.toolbar.clear();
            this.h.toolbar.context = notification;
            actions.forEach(action => this.h.toolbar.push(action, { icon: true, label: false, keybinding: this.G(action) }));
        }
        z(notification) {
            if (notification.expanded && notification.source) {
                this.h.source.textContent = (0, nls_1.localize)(2, null, notification.source);
                this.h.source.title = notification.source;
            }
            else {
                this.h.source.textContent = '';
                this.h.source.removeAttribute('title');
            }
        }
        C(notification) {
            (0, dom_1.$lO)(this.h.buttonsContainer);
            const primaryActions = notification.actions ? notification.actions.primary : undefined;
            if (notification.expanded && (0, arrays_1.$Jb)(primaryActions)) {
                const that = this;
                const actionRunner = new class extends actions_1.$hi {
                    async u(action) {
                        // Run action
                        that.j.run(action, notification);
                        // Hide notification (unless explicitly prevented)
                        if (!(action instanceof notifications_1.$Pzb) || !action.keepOpen) {
                            notification.close();
                        }
                    }
                }();
                const buttonToolbar = this.g.add(new button_1.$0Q(this.h.buttonsContainer));
                for (let i = 0; i < primaryActions.length; i++) {
                    const action = primaryActions[i];
                    const options = {
                        title: true,
                        secondary: i > 0,
                        ...defaultStyles_1.$i2
                    };
                    const dropdownActions = action instanceof notifications_1.$Pzb ? action.menu : undefined;
                    const button = this.g.add(dropdownActions ?
                        buttonToolbar.addButtonWithDropdown({
                            ...options,
                            contextMenuProvider: this.s,
                            actions: dropdownActions,
                            actionRunner
                        }) :
                        buttonToolbar.addButton(options));
                    button.label = action.label;
                    this.g.add(button.onDidClick(e => {
                        if (e) {
                            dom_1.$5O.stop(e, true);
                        }
                        actionRunner.run(action);
                    }));
                }
            }
        }
        D(notification) {
            // Return early if the item has no progress
            if (!notification.hasProgress) {
                this.h.progress.stop().hide();
                return;
            }
            // Infinite
            const state = notification.progress.state;
            if (state.infinite) {
                this.h.progress.infinite().show();
            }
            // Total / Worked
            else if (typeof state.total === 'number' || typeof state.worked === 'number') {
                if (typeof state.total === 'number' && !this.h.progress.hasTotal()) {
                    this.h.progress.total(state.total);
                }
                if (typeof state.worked === 'number') {
                    this.h.progress.setWorked(state.worked).show();
                }
            }
            // Done
            else {
                this.h.progress.done().hide();
            }
        }
        F(severity) {
            switch (severity) {
                case notification_1.Severity.Warning:
                    return codicons_1.$Pj.warning;
                case notification_1.Severity.Error:
                    return codicons_1.$Pj.error;
            }
            return codicons_1.$Pj.info;
        }
        G(action) {
            const keybinding = this.r.lookupKeybinding(action.id);
            return keybinding ? keybinding.getLabel() : null;
        }
    };
    exports.$$1b = $$1b;
    exports.$$1b = $$1b = $$1b_1 = __decorate([
        __param(2, opener_1.$NT),
        __param(3, instantiation_1.$Ah),
        __param(4, keybinding_1.$2D),
        __param(5, contextView_1.$WZ)
    ], $$1b);
});
//# sourceMappingURL=notificationsViewer.js.map