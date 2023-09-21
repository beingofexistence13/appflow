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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, lifecycle_1, event_1, actions_1, contextkey_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompositeMenuActions = void 0;
    class MenuActions extends lifecycle_1.Disposable {
        get primaryActions() { return this._primaryActions; }
        get secondaryActions() { return this._secondaryActions; }
        constructor(menuId, options, menuService, contextKeyService) {
            super();
            this.options = options;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this._primaryActions = [];
            this._secondaryActions = [];
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.menu = this._register(menuService.createMenu(menuId, contextKeyService));
            this._register(this.menu.onDidChange(() => this.updateActions()));
            this.updateActions();
        }
        updateActions() {
            this.disposables.clear();
            this._primaryActions = [];
            this._secondaryActions = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, this.options, { primary: this._primaryActions, secondary: this._secondaryActions });
            this.disposables.add(this.updateSubmenus([...this._primaryActions, ...this._secondaryActions], {}));
            this._onDidChange.fire();
        }
        updateSubmenus(actions, submenus) {
            const disposables = new lifecycle_1.DisposableStore();
            for (const action of actions) {
                if (action instanceof actions_1.SubmenuItemAction && !submenus[action.item.submenu.id]) {
                    const menu = submenus[action.item.submenu.id] = disposables.add(this.menuService.createMenu(action.item.submenu, this.contextKeyService));
                    disposables.add(menu.onDidChange(() => this.updateActions()));
                    disposables.add(this.updateSubmenus(action.actions, submenus));
                }
            }
            return disposables;
        }
    }
    let CompositeMenuActions = class CompositeMenuActions extends lifecycle_1.Disposable {
        constructor(menuId, contextMenuId, options, contextKeyService, menuService) {
            super();
            this.menuId = menuId;
            this.contextMenuId = contextMenuId;
            this.options = options;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.menuActions = this._register(new MenuActions(menuId, this.options, menuService, contextKeyService));
            this._register(this.menuActions.onDidChange(() => this._onDidChange.fire()));
        }
        getPrimaryActions() {
            return this.menuActions.primaryActions;
        }
        getSecondaryActions() {
            return this.menuActions.secondaryActions;
        }
        getContextMenuActions() {
            const actions = [];
            if (this.contextMenuId) {
                const menu = this.menuService.createMenu(this.contextMenuId, this.contextKeyService);
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, this.options, { primary: [], secondary: actions });
                menu.dispose();
            }
            return actions;
        }
    };
    exports.CompositeMenuActions = CompositeMenuActions;
    exports.CompositeMenuActions = CompositeMenuActions = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, actions_1.IMenuService)
    ], CompositeMenuActions);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL2FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBU2hHLE1BQU0sV0FBWSxTQUFRLHNCQUFVO1FBS25DLElBQUksY0FBYyxLQUFLLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFHckQsSUFBSSxnQkFBZ0IsS0FBSyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFPekQsWUFDQyxNQUFjLEVBQ0csT0FBdUMsRUFDdkMsV0FBeUIsRUFDekIsaUJBQXFDO1lBRXRELEtBQUssRUFBRSxDQUFDO1lBSlMsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7WUFDdkMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDekIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQWYvQyxvQkFBZSxHQUFjLEVBQUUsQ0FBQztZQUdoQyxzQkFBaUIsR0FBYyxFQUFFLENBQUM7WUFHekIsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUMzRCxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRXZDLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBVTNELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFFOUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FB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