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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/contrib/scm/common/scm", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/nls", "vs/css!./media/scm"], function (require, exports, event_1, lifecycle_1, contextkey_1, actions_1, menuEntryActionViewItem_1, scm_1, arrays_1, instantiation_1, serviceCollection_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMMenus = exports.SCMRepositoryMenus = exports.SCMTitleMenu = void 0;
    function actionEquals(a, b) {
        return a.id === b.id;
    }
    let SCMTitleMenu = class SCMTitleMenu {
        get actions() { return this._actions; }
        get secondaryActions() { return this._secondaryActions; }
        constructor(menuService, contextKeyService) {
            this._actions = [];
            this._secondaryActions = [];
            this._onDidChangeTitle = new event_1.Emitter();
            this.onDidChangeTitle = this._onDidChangeTitle.event;
            this.disposables = new lifecycle_1.DisposableStore();
            this.menu = menuService.createMenu(actions_1.MenuId.SCMTitle, contextKeyService);
            this.disposables.add(this.menu);
            this.menu.onDidChange(this.updateTitleActions, this, this.disposables);
            this.updateTitleActions();
        }
        updateTitleActions() {
            const primary = [];
            const secondary = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { shouldForwardArgs: true }, { primary, secondary });
            if ((0, arrays_1.equals)(primary, this._actions, actionEquals) && (0, arrays_1.equals)(secondary, this._secondaryActions, actionEquals)) {
                return;
            }
            this._actions = primary;
            this._secondaryActions = secondary;
            this._onDidChangeTitle.fire();
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.SCMTitleMenu = SCMTitleMenu;
    exports.SCMTitleMenu = SCMTitleMenu = __decorate([
        __param(0, actions_1.IMenuService),
        __param(1, contextkey_1.IContextKeyService)
    ], SCMTitleMenu);
    class SCMMenusItem {
        get resourceGroupMenu() {
            if (!this._resourceGroupMenu) {
                this._resourceGroupMenu = this.menuService.createMenu(actions_1.MenuId.SCMResourceGroupContext, this.contextKeyService);
            }
            return this._resourceGroupMenu;
        }
        get resourceFolderMenu() {
            if (!this._resourceFolderMenu) {
                this._resourceFolderMenu = this.menuService.createMenu(actions_1.MenuId.SCMResourceFolderContext, this.contextKeyService);
            }
            return this._resourceFolderMenu;
        }
        constructor(contextKeyService, menuService) {
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
        }
        getResourceMenu(resource) {
            if (typeof resource.contextValue === 'undefined') {
                if (!this.genericResourceMenu) {
                    this.genericResourceMenu = this.menuService.createMenu(actions_1.MenuId.SCMResourceContext, this.contextKeyService);
                }
                return this.genericResourceMenu;
            }
            if (!this.contextualResourceMenus) {
                this.contextualResourceMenus = new Map();
            }
            let item = this.contextualResourceMenus.get(resource.contextValue);
            if (!item) {
                const contextKeyService = this.contextKeyService.createOverlay([['scmResourceState', resource.contextValue]]);
                const menu = this.menuService.createMenu(actions_1.MenuId.SCMResourceContext, contextKeyService);
                item = {
                    menu, dispose() {
                        menu.dispose();
                    }
                };
                this.contextualResourceMenus.set(resource.contextValue, item);
            }
            return item.menu;
        }
        dispose() {
            this._resourceGroupMenu?.dispose();
            this._resourceFolderMenu?.dispose();
            this.genericResourceMenu?.dispose();
            if (this.contextualResourceMenus) {
                (0, lifecycle_1.dispose)(this.contextualResourceMenus.values());
                this.contextualResourceMenus.clear();
                this.contextualResourceMenus = undefined;
            }
        }
    }
    let SCMRepositoryMenus = class SCMRepositoryMenus {
        get repositoryMenu() {
            if (!this._repositoryMenu) {
                this._repositoryMenu = this.menuService.createMenu(actions_1.MenuId.SCMSourceControl, this.contextKeyService);
                this.disposables.add(this._repositoryMenu);
            }
            return this._repositoryMenu;
        }
        constructor(provider, contextKeyService, instantiationService, menuService) {
            this.menuService = menuService;
            this.resourceGroups = [];
            this.resourceGroupMenusItems = new Map();
            this.disposables = new lifecycle_1.DisposableStore();
            this.contextKeyService = contextKeyService.createOverlay([
                ['scmProvider', provider.contextValue],
                ['scmProviderRootUri', provider.rootUri?.toString()],
                ['scmProviderHasRootUri', !!provider.rootUri],
            ]);
            const serviceCollection = new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.contextKeyService]);
            instantiationService = instantiationService.createChild(serviceCollection);
            this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
            provider.groups.onDidSplice(this.onDidSpliceGroups, this, this.disposables);
            this.onDidSpliceGroups({ start: 0, deleteCount: 0, toInsert: provider.groups.elements });
        }
        getResourceGroupMenu(group) {
            return this.getOrCreateResourceGroupMenusItem(group).resourceGroupMenu;
        }
        getResourceMenu(resource) {
            return this.getOrCreateResourceGroupMenusItem(resource.resourceGroup).getResourceMenu(resource);
        }
        getResourceFolderMenu(group) {
            return this.getOrCreateResourceGroupMenusItem(group).resourceFolderMenu;
        }
        getOrCreateResourceGroupMenusItem(group) {
            let result = this.resourceGroupMenusItems.get(group);
            if (!result) {
                const contextKeyService = this.contextKeyService.createOverlay([
                    ['scmResourceGroup', group.id],
                ]);
                result = new SCMMenusItem(contextKeyService, this.menuService);
                this.resourceGroupMenusItems.set(group, result);
            }
            return result;
        }
        onDidSpliceGroups({ start, deleteCount, toInsert }) {
            const deleted = this.resourceGroups.splice(start, deleteCount, ...toInsert);
            for (const group of deleted) {
                const item = this.resourceGroupMenusItems.get(group);
                item?.dispose();
                this.resourceGroupMenusItems.delete(group);
            }
        }
        dispose() {
            this.disposables.dispose();
            this.resourceGroupMenusItems.forEach(item => item.dispose());
        }
    };
    exports.SCMRepositoryMenus = SCMRepositoryMenus;
    exports.SCMRepositoryMenus = SCMRepositoryMenus = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, actions_1.IMenuService)
    ], SCMRepositoryMenus);
    let SCMMenus = class SCMMenus {
        constructor(scmService, instantiationService) {
            this.instantiationService = instantiationService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.menus = new Map();
            this.titleMenu = instantiationService.createInstance(SCMTitleMenu);
            scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
        }
        onDidRemoveRepository(repository) {
            const menus = this.menus.get(repository.provider);
            menus?.dispose();
            this.menus.delete(repository.provider);
        }
        getRepositoryMenus(provider) {
            let result = this.menus.get(provider);
            if (!result) {
                const menus = this.instantiationService.createInstance(SCMRepositoryMenus, provider);
                const dispose = () => {
                    menus.dispose();
                    this.menus.delete(provider);
                };
                result = { menus, dispose };
                this.menus.set(provider, result);
            }
            return result.menus;
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    exports.SCMMenus = SCMMenus;
    exports.SCMMenus = SCMMenus = __decorate([
        __param(0, scm_1.ISCMService),
        __param(1, instantiation_1.IInstantiationService)
    ], SCMMenus);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.SCMResourceContext, {
        title: (0, nls_1.localize)('miShare', "Share"),
        submenu: actions_1.MenuId.SCMResourceContextShare,
        group: '45_share',
        order: 3,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zY20vYnJvd3Nlci9tZW51cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQmhHLFNBQVMsWUFBWSxDQUFDLENBQVUsRUFBRSxDQUFVO1FBQzNDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxJQUFNLFlBQVksR0FBbEIsTUFBTSxZQUFZO1FBR3hCLElBQUksT0FBTyxLQUFnQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBR2xELElBQUksZ0JBQWdCLEtBQWdCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQVFwRSxZQUNlLFdBQXlCLEVBQ25CLGlCQUFxQztZQWRsRCxhQUFRLEdBQWMsRUFBRSxDQUFDO1lBR3pCLHNCQUFpQixHQUFjLEVBQUUsQ0FBQztZQUd6QixzQkFBaUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ2hELHFCQUFnQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7WUFHeEMsZ0JBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQU1wRCxJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsZ0JBQU0sQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVPLGtCQUFrQjtZQUN6QixNQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7WUFDOUIsTUFBTSxTQUFTLEdBQWMsRUFBRSxDQUFDO1lBQ2hDLElBQUEseURBQStCLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFFaEcsSUFBSSxJQUFBLGVBQU0sRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsSUFBSSxJQUFBLGVBQU0sRUFBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxFQUFFO2dCQUM1RyxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDO1lBRW5DLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDNUIsQ0FBQztLQUNELENBQUE7SUEzQ1ksb0NBQVk7MkJBQVosWUFBWTtRQWV0QixXQUFBLHNCQUFZLENBQUE7UUFDWixXQUFBLCtCQUFrQixDQUFBO09BaEJSLFlBQVksQ0EyQ3hCO0lBT0QsTUFBTSxZQUFZO1FBR2pCLElBQUksaUJBQWlCO1lBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxnQkFBTSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQzlHO1lBRUQsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDaEMsQ0FBQztRQUdELElBQUksa0JBQWtCO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxnQkFBTSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ2hIO1lBRUQsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7UUFDakMsQ0FBQztRQUtELFlBQ1MsaUJBQXFDLEVBQ3JDLFdBQXlCO1lBRHpCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDckMsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFDOUIsQ0FBQztRQUVMLGVBQWUsQ0FBQyxRQUFzQjtZQUNyQyxJQUFJLE9BQU8sUUFBUSxDQUFDLFlBQVksS0FBSyxXQUFXLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxnQkFBTSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lCQUMxRztnQkFFRCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQzthQUNoQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLEdBQUcsRUFBdUMsQ0FBQzthQUM5RTtZQUVELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRW5FLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1YsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5RyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxnQkFBTSxDQUFDLGtCQUFrQixFQUFFLGlCQUFpQixDQUFDLENBQUM7Z0JBRXZGLElBQUksR0FBRztvQkFDTixJQUFJLEVBQUUsT0FBTzt3QkFDWixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2hCLENBQUM7aUJBQ0QsQ0FBQztnQkFFRixJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDOUQ7WUFFRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUVwQyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtnQkFDakMsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxTQUFTLENBQUM7YUFDekM7UUFDRixDQUFDO0tBQ0Q7SUFFTSxJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFrQjtRQVM5QixJQUFJLGNBQWM7WUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsZ0JBQU0sQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDcEcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQzNDO1lBRUQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFJRCxZQUNDLFFBQXNCLEVBQ0YsaUJBQXFDLEVBQ2xDLG9CQUEyQyxFQUNwRCxXQUEwQztZQUF6QixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQW5CeEMsbUJBQWMsR0FBd0IsRUFBRSxDQUFDO1lBQ3pDLDRCQUF1QixHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBWXJFLGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFRcEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDLGFBQWEsQ0FBQztnQkFDeEQsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQztnQkFDdEMsQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO2dCQUNwRCxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO2FBQzdDLENBQUMsQ0FBQztZQUVILE1BQU0saUJBQWlCLEdBQUcsSUFBSSxxQ0FBaUIsQ0FBQyxDQUFDLCtCQUFrQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDOUYsb0JBQW9CLEdBQUcsb0JBQW9CLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFbkUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUVELG9CQUFvQixDQUFDLEtBQXdCO1lBQzVDLE9BQU8sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEtBQUssQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1FBQ3hFLENBQUM7UUFFRCxlQUFlLENBQUMsUUFBc0I7WUFDckMsT0FBTyxJQUFJLENBQUMsaUNBQWlDLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRyxDQUFDO1FBRUQscUJBQXFCLENBQUMsS0FBd0I7WUFDN0MsT0FBTyxJQUFJLENBQUMsaUNBQWlDLENBQUMsS0FBSyxDQUFDLENBQUMsa0JBQWtCLENBQUM7UUFDekUsQ0FBQztRQUVPLGlDQUFpQyxDQUFDLEtBQXdCO1lBQ2pFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFckQsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUM7b0JBQzlELENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztpQkFDOUIsQ0FBQyxDQUFDO2dCQUVILE1BQU0sR0FBRyxJQUFJLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQy9ELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ2hEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8saUJBQWlCLENBQUMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBOEI7WUFDckYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBRTVFLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO2dCQUM1QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDM0M7UUFDRixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzlELENBQUM7S0FDRCxDQUFBO0lBakZZLGdEQUFrQjtpQ0FBbEIsa0JBQWtCO1FBc0I1QixXQUFBLCtCQUFrQixDQUFBO1FBQ2xCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxzQkFBWSxDQUFBO09BeEJGLGtCQUFrQixDQWlGOUI7SUFFTSxJQUFNLFFBQVEsR0FBZCxNQUFNLFFBQVE7UUFNcEIsWUFDYyxVQUF1QixFQUNiLG9CQUFtRDtZQUEzQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBTDFELGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDcEMsVUFBSyxHQUFHLElBQUksR0FBRyxFQUFvRSxDQUFDO1lBTXBHLElBQUksQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ25FLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRU8scUJBQXFCLENBQUMsVUFBMEI7WUFDdkQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVELGtCQUFrQixDQUFDLFFBQXNCO1lBQ3hDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXRDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDckYsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO29CQUNwQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM3QixDQUFDLENBQUM7Z0JBRUYsTUFBTSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDakM7WUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDckIsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRCxDQUFBO0lBeENZLDRCQUFRO3VCQUFSLFFBQVE7UUFPbEIsV0FBQSxpQkFBVyxDQUFBO1FBQ1gsV0FBQSxxQ0FBcUIsQ0FBQTtPQVJYLFFBQVEsQ0F3Q3BCO0lBRUQsc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxrQkFBa0IsRUFBRTtRQUN0RCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQztRQUNuQyxPQUFPLEVBQUUsZ0JBQU0sQ0FBQyx1QkFBdUI7UUFDdkMsS0FBSyxFQUFFLFVBQVU7UUFDakIsS0FBSyxFQUFFLENBQUM7S0FDUixDQUFDLENBQUMifQ==