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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, dom, actionbar_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, actions_1, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SuggestWidgetStatus = void 0;
    class StatusBarViewItem extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        updateLabel() {
            const kb = this._keybindingService.lookupKeybinding(this._action.id, this._contextKeyService);
            if (!kb) {
                return super.updateLabel();
            }
            if (this.label) {
                this.label.textContent = (0, nls_1.localize)({ key: 'content', comment: ['A label', 'A keybinding'] }, '{0} ({1})', this._action.label, StatusBarViewItem.symbolPrintEnter(kb));
            }
        }
        static symbolPrintEnter(kb) {
            return kb.getLabel()?.replace(/\benter\b/gi, '\u23CE');
        }
    }
    let SuggestWidgetStatus = class SuggestWidgetStatus {
        constructor(container, _menuId, instantiationService, _menuService, _contextKeyService) {
            this._menuId = _menuId;
            this._menuService = _menuService;
            this._contextKeyService = _contextKeyService;
            this._menuDisposables = new lifecycle_1.DisposableStore();
            this.element = dom.append(container, dom.$('.suggest-status-bar'));
            const actionViewItemProvider = (action => {
                return action instanceof actions_1.MenuItemAction ? instantiationService.createInstance(StatusBarViewItem, action, undefined) : undefined;
            });
            this._leftActions = new actionbar_1.ActionBar(this.element, { actionViewItemProvider });
            this._rightActions = new actionbar_1.ActionBar(this.element, { actionViewItemProvider });
            this._leftActions.domNode.classList.add('left');
            this._rightActions.domNode.classList.add('right');
        }
        dispose() {
            this._menuDisposables.dispose();
            this._leftActions.dispose();
            this._rightActions.dispose();
            this.element.remove();
        }
        show() {
            const menu = this._menuService.createMenu(this._menuId, this._contextKeyService);
            const renderMenu = () => {
                const left = [];
                const right = [];
                for (const [group, actions] of menu.getActions()) {
                    if (group === 'left') {
                        left.push(...actions);
                    }
                    else {
                        right.push(...actions);
                    }
                }
                this._leftActions.clear();
                this._leftActions.push(left);
                this._rightActions.clear();
                this._rightActions.push(right);
            };
            this._menuDisposables.add(menu.onDidChange(() => renderMenu()));
            this._menuDisposables.add(menu);
        }
        hide() {
            this._menuDisposables.clear();
        }
    };
    exports.SuggestWidgetStatus = SuggestWidgetStatus;
    exports.SuggestWidgetStatus = SuggestWidgetStatus = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, actions_1.IMenuService),
        __param(4, contextkey_1.IContextKeyService)
    ], SuggestWidgetStatus);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdFdpZGdldFN0YXR1cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N1Z2dlc3QvYnJvd3Nlci9zdWdnZXN0V2lkZ2V0U3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWFoRyxNQUFNLGlCQUFrQixTQUFRLGlEQUF1QjtRQUVuQyxXQUFXO1lBQzdCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM5RixJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUNSLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzNCO1lBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNySztRQUNGLENBQUM7UUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBc0I7WUFDN0MsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RCxDQUFDO0tBQ0Q7SUFFTSxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtRQVEvQixZQUNDLFNBQXNCLEVBQ0wsT0FBZSxFQUNULG9CQUEyQyxFQUNwRCxZQUFrQyxFQUM1QixrQkFB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