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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/notifications/notificationsList", "vs/base/browser/dom", "vs/platform/list/browser/listService", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/theme", "vs/workbench/browser/parts/notifications/notificationsViewer", "vs/workbench/browser/parts/notifications/notificationsActions", "vs/platform/contextview/browser/contextView", "vs/base/common/types", "vs/workbench/common/contextkeys", "vs/base/common/lifecycle", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/platform/keybinding/common/keybinding", "vs/platform/configuration/common/configuration", "vs/css!./media/notificationsList"], function (require, exports, nls_1, dom_1, listService_1, instantiation_1, theme_1, notificationsViewer_1, notificationsActions_1, contextView_1, types_1, contextkeys_1, lifecycle_1, notificationsCommands_1, keybinding_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_1b = void 0;
    let $_1b = class $_1b extends lifecycle_1.$kc {
        constructor(h, j, m, n) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.f = [];
        }
        show() {
            if (this.g) {
                return; // already visible
            }
            // Lazily create if showing for the first time
            if (!this.b) {
                this.r();
            }
            // Make visible
            this.g = true;
        }
        r() {
            // List Container
            this.a = document.createElement('div');
            this.a.classList.add('notifications-list-container');
            const actionRunner = this.B(this.m.createInstance(notificationsCommands_1.$bJb));
            // Notification Renderer
            const renderer = this.m.createInstance(notificationsViewer_1.$01b, actionRunner);
            // List
            const listDelegate = this.c = new notificationsViewer_1.$91b(this.a);
            const options = this.j;
            const list = this.b = this.B(this.m.createInstance(listService_1.$p4, 'NotificationsList', this.a, listDelegate, [renderer], {
                ...options,
                setRowLineHeight: false,
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: theme_1.$0ab
                },
                accessibilityProvider: this.m.createInstance(NotificationAccessibilityProvider, options)
            }));
            // Context menu to copy message
            const copyAction = this.B(this.m.createInstance(notificationsActions_1.$81b, notificationsActions_1.$81b.ID, notificationsActions_1.$81b.LABEL));
            this.B((list.onContextMenu(e => {
                if (!e.element) {
                    return;
                }
                this.n.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => [copyAction],
                    getActionsContext: () => e.element,
                    actionRunner
                });
            })));
            // Toggle on double click
            this.B((list.onMouseDblClick(event => event.element.toggle())));
            // Clear focus when DOM focus moves out
            // Use document.hasFocus() to not clear the focus when the entire window lost focus
            // This ensures that when the focus comes back, the notification is still focused
            const listFocusTracker = this.B((0, dom_1.$8O)(list.getHTMLElement()));
            this.B(listFocusTracker.onDidBlur(() => {
                if (document.hasFocus()) {
                    list.setFocus([]);
                }
            }));
            // Context key
            contextkeys_1.$vdb.bindTo(list.contextKeyService);
            // Only allow for focus in notifications, as the
            // selection is too strong over the contents of
            // the notification
            this.B(list.onDidChangeSelection(e => {
                if (e.indexes.length > 0) {
                    list.setSelection([]);
                }
            }));
            this.h.appendChild(this.a);
        }
        updateNotificationsList(start, deleteCount, items = []) {
            const [list, listContainer] = (0, types_1.$vf)(this.b, this.a);
            const listHasDOMFocus = (0, dom_1.$NO)(document.activeElement, listContainer);
            // Remember focus and relative top of that item
            const focusedIndex = list.getFocus()[0];
            const focusedItem = this.f[focusedIndex];
            let focusRelativeTop = null;
            if (typeof focusedIndex === 'number') {
                focusRelativeTop = list.getRelativeTop(focusedIndex);
            }
            // Update view model
            this.f.splice(start, deleteCount, ...items);
            // Update list
            list.splice(start, deleteCount, items);
            list.layout();
            // Hide if no more notifications to show
            if (this.f.length === 0) {
                this.hide();
            }
            // Otherwise restore focus if we had
            else if (typeof focusedIndex === 'number') {
                let indexToFocus = 0;
                if (focusedItem) {
                    let indexToFocusCandidate = this.f.indexOf(focusedItem);
                    if (indexToFocusCandidate === -1) {
                        indexToFocusCandidate = focusedIndex - 1; // item could have been removed
                    }
                    if (indexToFocusCandidate < this.f.length && indexToFocusCandidate >= 0) {
                        indexToFocus = indexToFocusCandidate;
                    }
                }
                if (typeof focusRelativeTop === 'number') {
                    list.reveal(indexToFocus, focusRelativeTop);
                }
                list.setFocus([indexToFocus]);
            }
            // Restore DOM focus if we had focus before
            if (this.g && listHasDOMFocus) {
                list.domFocus();
            }
        }
        updateNotificationHeight(item) {
            const index = this.f.indexOf(item);
            if (index === -1) {
                return;
            }
            const [list, listDelegate] = (0, types_1.$vf)(this.b, this.c);
            list.updateElementHeight(index, listDelegate.getHeight(item));
            list.layout();
        }
        hide() {
            if (!this.g || !this.b) {
                return; // already hidden
            }
            // Hide
            this.g = false;
            // Clear list
            this.b.splice(0, this.f.length);
            // Clear view model
            this.f = [];
        }
        focusFirst() {
            if (!this.b) {
                return; // not created yet
            }
            this.b.focusFirst();
            this.b.domFocus();
        }
        hasFocus() {
            if (!this.a) {
                return false; // not created yet
            }
            return (0, dom_1.$NO)(document.activeElement, this.a);
        }
        layout(width, maxHeight) {
            if (this.a && this.b) {
                this.a.style.width = `${width}px`;
                if (typeof maxHeight === 'number') {
                    this.b.getHTMLElement().style.maxHeight = `${maxHeight}px`;
                }
                this.b.layout();
            }
        }
        dispose() {
            this.hide();
            super.dispose();
        }
    };
    exports.$_1b = $_1b;
    exports.$_1b = $_1b = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, contextView_1.$WZ)
    ], $_1b);
    let NotificationAccessibilityProvider = class NotificationAccessibilityProvider {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        getAriaLabel(element) {
            let accessibleViewHint;
            const keybinding = this.b.lookupKeybinding('editor.action.accessibleView')?.getAriaLabel();
            if (this.c.getValue('accessibility.verbosity.notification')) {
                accessibleViewHint = keybinding ? (0, nls_1.localize)(0, null, keybinding) : (0, nls_1.localize)(1, null);
            }
            if (!element.source) {
                return accessibleViewHint ? (0, nls_1.localize)(2, null, element.message.raw, accessibleViewHint) : (0, nls_1.localize)(3, null, element.message.raw);
            }
            return accessibleViewHint ? (0, nls_1.localize)(4, null, element.message.raw, element.source, accessibleViewHint) : (0, nls_1.localize)(5, null, element.message.raw, element.source);
        }
        getWidgetAriaLabel() {
            return this.a.widgetAriaLabel ?? (0, nls_1.localize)(6, null);
        }
        getRole() {
            return 'dialog'; // https://github.com/microsoft/vscode/issues/82728
        }
    };
    NotificationAccessibilityProvider = __decorate([
        __param(1, keybinding_1.$2D),
        __param(2, configuration_1.$8h)
    ], NotificationAccessibilityProvider);
});
//# sourceMappingURL=notificationsList.js.map