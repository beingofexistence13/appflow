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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/platform/accessibility/common/accessibility"], function (require, exports, DOM, keyboardEvent_1, actionViewItems_1, dropdownActionViewItem_1, menuEntryActionViewItem_1, contextkey_1, keybinding_1, notification_1, themeService_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Vqb = void 0;
    let $Vqb = class $Vqb extends actionViewItems_1.$MQ {
        get onDidChangeDropdownVisibility() {
            return this.b.onDidChangeVisibility;
        }
        constructor(primaryAction, dropdownAction, dropdownMenuActions, className, h, n, _keybindingService, _notificationService, _contextKeyService, _themeService, _accessibilityService) {
            super(null, primaryAction);
            this.h = h;
            this.n = n;
            this.c = null;
            this.g = null;
            this.a = new menuEntryActionViewItem_1.$C3(primaryAction, undefined, _keybindingService, _notificationService, _contextKeyService, _themeService, h, _accessibilityService);
            this.b = new dropdownActionViewItem_1.$CR(dropdownAction, dropdownMenuActions, this.h, {
                menuAsChild: true,
                classNames: className ? ['codicon', 'codicon-chevron-down', className] : ['codicon', 'codicon-chevron-down'],
                keybindingProvider: this.n?.getKeyBinding
            });
        }
        setActionContext(newContext) {
            super.setActionContext(newContext);
            this.a.setActionContext(newContext);
            this.b.setActionContext(newContext);
        }
        render(container) {
            this.c = container;
            super.render(this.c);
            this.c.classList.add('monaco-dropdown-with-primary');
            const primaryContainer = DOM.$('.action-container');
            this.a.render(DOM.$0O(this.c, primaryContainer));
            this.g = DOM.$('.dropdown-action-container');
            this.b.render(DOM.$0O(this.c, this.g));
            this.B(DOM.$nO(primaryContainer, DOM.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(17 /* KeyCode.RightArrow */)) {
                    this.a.element.tabIndex = -1;
                    this.b.focus();
                    event.stopPropagation();
                }
            }));
            this.B(DOM.$nO(this.g, DOM.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    this.a.element.tabIndex = 0;
                    this.b.setFocusable(false);
                    this.a.element?.focus();
                    event.stopPropagation();
                }
            }));
        }
        focus(fromRight) {
            if (fromRight) {
                this.b.focus();
            }
            else {
                this.a.element.tabIndex = 0;
                this.a.element.focus();
            }
        }
        blur() {
            this.a.element.tabIndex = -1;
            this.b.blur();
            this.c.blur();
        }
        setFocusable(focusable) {
            if (focusable) {
                this.a.element.tabIndex = 0;
            }
            else {
                this.a.element.tabIndex = -1;
                this.b.setFocusable(false);
            }
        }
        update(dropdownAction, dropdownMenuActions, dropdownIcon) {
            this.b.dispose();
            this.b = new dropdownActionViewItem_1.$CR(dropdownAction, dropdownMenuActions, this.h, {
                menuAsChild: true,
                classNames: ['codicon', dropdownIcon || 'codicon-chevron-down']
            });
            if (this.g) {
                this.b.render(this.g);
            }
        }
        dispose() {
            this.a.dispose();
            this.b.dispose();
            super.dispose();
        }
    };
    exports.$Vqb = $Vqb;
    exports.$Vqb = $Vqb = __decorate([
        __param(6, keybinding_1.$2D),
        __param(7, notification_1.$Yu),
        __param(8, contextkey_1.$3i),
        __param(9, themeService_1.$gv),
        __param(10, accessibility_1.$1r)
    ], $Vqb);
});
//# sourceMappingURL=dropdownWithPrimaryActionViewItem.js.map