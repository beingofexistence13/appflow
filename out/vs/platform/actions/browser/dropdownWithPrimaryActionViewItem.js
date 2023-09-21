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
    exports.DropdownWithPrimaryActionViewItem = void 0;
    let DropdownWithPrimaryActionViewItem = class DropdownWithPrimaryActionViewItem extends actionViewItems_1.BaseActionViewItem {
        get onDidChangeDropdownVisibility() {
            return this._dropdown.onDidChangeVisibility;
        }
        constructor(primaryAction, dropdownAction, dropdownMenuActions, className, _contextMenuProvider, _options, _keybindingService, _notificationService, _contextKeyService, _themeService, _accessibilityService) {
            super(null, primaryAction);
            this._contextMenuProvider = _contextMenuProvider;
            this._options = _options;
            this._container = null;
            this._dropdownContainer = null;
            this._primaryAction = new menuEntryActionViewItem_1.MenuEntryActionViewItem(primaryAction, undefined, _keybindingService, _notificationService, _contextKeyService, _themeService, _contextMenuProvider, _accessibilityService);
            this._dropdown = new dropdownActionViewItem_1.DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
                menuAsChild: true,
                classNames: className ? ['codicon', 'codicon-chevron-down', className] : ['codicon', 'codicon-chevron-down'],
                keybindingProvider: this._options?.getKeyBinding
            });
        }
        setActionContext(newContext) {
            super.setActionContext(newContext);
            this._primaryAction.setActionContext(newContext);
            this._dropdown.setActionContext(newContext);
        }
        render(container) {
            this._container = container;
            super.render(this._container);
            this._container.classList.add('monaco-dropdown-with-primary');
            const primaryContainer = DOM.$('.action-container');
            this._primaryAction.render(DOM.append(this._container, primaryContainer));
            this._dropdownContainer = DOM.$('.dropdown-action-container');
            this._dropdown.render(DOM.append(this._container, this._dropdownContainer));
            this._register(DOM.addDisposableListener(primaryContainer, DOM.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(17 /* KeyCode.RightArrow */)) {
                    this._primaryAction.element.tabIndex = -1;
                    this._dropdown.focus();
                    event.stopPropagation();
                }
            }));
            this._register(DOM.addDisposableListener(this._dropdownContainer, DOM.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    this._primaryAction.element.tabIndex = 0;
                    this._dropdown.setFocusable(false);
                    this._primaryAction.element?.focus();
                    event.stopPropagation();
                }
            }));
        }
        focus(fromRight) {
            if (fromRight) {
                this._dropdown.focus();
            }
            else {
                this._primaryAction.element.tabIndex = 0;
                this._primaryAction.element.focus();
            }
        }
        blur() {
            this._primaryAction.element.tabIndex = -1;
            this._dropdown.blur();
            this._container.blur();
        }
        setFocusable(focusable) {
            if (focusable) {
                this._primaryAction.element.tabIndex = 0;
            }
            else {
                this._primaryAction.element.tabIndex = -1;
                this._dropdown.setFocusable(false);
            }
        }
        update(dropdownAction, dropdownMenuActions, dropdownIcon) {
            this._dropdown.dispose();
            this._dropdown = new dropdownActionViewItem_1.DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
                menuAsChild: true,
                classNames: ['codicon', dropdownIcon || 'codicon-chevron-down']
            });
            if (this._dropdownContainer) {
                this._dropdown.render(this._dropdownContainer);
            }
        }
        dispose() {
            this._primaryAction.dispose();
            this._dropdown.dispose();
            super.dispose();
        }
    };
    exports.DropdownWithPrimaryActionViewItem = DropdownWithPrimaryActionViewItem;
    exports.DropdownWithPrimaryActionViewItem = DropdownWithPrimaryActionViewItem = __decorate([
        __param(6, keybinding_1.IKeybindingService),
        __param(7, notification_1.INotificationService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, themeService_1.IThemeService),
        __param(10, accessibility_1.IAccessibilityService)
    ], DropdownWithPrimaryActionViewItem);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcGRvd25XaXRoUHJpbWFyeUFjdGlvblZpZXdJdGVtLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYWN0aW9ucy9icm93c2VyL2Ryb3Bkb3duV2l0aFByaW1hcnlBY3Rpb25WaWV3SXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF1QnpGLElBQU0saUNBQWlDLEdBQXZDLE1BQU0saUNBQWtDLFNBQVEsb0NBQWtCO1FBTXhFLElBQUksNkJBQTZCO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztRQUM3QyxDQUFDO1FBRUQsWUFDQyxhQUE2QixFQUM3QixjQUF1QixFQUN2QixtQkFBOEIsRUFDOUIsU0FBaUIsRUFDQSxvQkFBeUMsRUFDekMsUUFBK0QsRUFDNUQsa0JBQXNDLEVBQ3BDLG9CQUEwQyxFQUM1QyxrQkFBc0MsRUFDM0MsYUFBNEIsRUFDcEIscUJBQTRDO1lBRW5FLEtBQUssQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFSVix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXFCO1lBQ3pDLGFBQVEsR0FBUixRQUFRLENBQXVEO1lBYnpFLGVBQVUsR0FBdUIsSUFBSSxDQUFDO1lBQ3RDLHVCQUFrQixHQUF1QixJQUFJLENBQUM7WUFvQnJELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxpREFBdUIsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQ3RNLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxtREFBMEIsQ0FBQyxjQUFjLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMvRyxXQUFXLEVBQUUsSUFBSTtn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