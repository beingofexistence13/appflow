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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/contrib/scm/common/scm", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/nls!vs/workbench/contrib/scm/browser/menus", "vs/css!./media/scm"], function (require, exports, event_1, lifecycle_1, contextkey_1, actions_1, menuEntryActionViewItem_1, scm_1, arrays_1, instantiation_1, serviceCollection_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MPb = exports.$LPb = exports.$KPb = void 0;
    function actionEquals(a, b) {
        return a.id === b.id;
    }
    let $KPb = class $KPb {
        get actions() { return this.c; }
        get secondaryActions() { return this.d; }
        constructor(menuService, contextKeyService) {
            this.c = [];
            this.d = [];
            this.e = new event_1.$fd();
            this.onDidChangeTitle = this.e.event;
            this.f = new lifecycle_1.$jc();
            this.menu = menuService.createMenu(actions_1.$Ru.SCMTitle, contextKeyService);
            this.f.add(this.menu);
            this.menu.onDidChange(this.g, this, this.f);
            this.g();
        }
        g() {
            const primary = [];
            const secondary = [];
            (0, menuEntryActionViewItem_1.$B3)(this.menu, { shouldForwardArgs: true }, { primary, secondary });
            if ((0, arrays_1.$sb)(primary, this.c, actionEquals) && (0, arrays_1.$sb)(secondary, this.d, actionEquals)) {
                return;
            }
            this.c = primary;
            this.d = secondary;
            this.e.fire();
        }
        dispose() {
            this.f.dispose();
        }
    };
    exports.$KPb = $KPb;
    exports.$KPb = $KPb = __decorate([
        __param(0, actions_1.$Su),
        __param(1, contextkey_1.$3i)
    ], $KPb);
    class SCMMenusItem {
        get resourceGroupMenu() {
            if (!this.c) {
                this.c = this.h.createMenu(actions_1.$Ru.SCMResourceGroupContext, this.g);
            }
            return this.c;
        }
        get resourceFolderMenu() {
            if (!this.d) {
                this.d = this.h.createMenu(actions_1.$Ru.SCMResourceFolderContext, this.g);
            }
            return this.d;
        }
        constructor(g, h) {
            this.g = g;
            this.h = h;
        }
        getResourceMenu(resource) {
            if (typeof resource.contextValue === 'undefined') {
                if (!this.e) {
                    this.e = this.h.createMenu(actions_1.$Ru.SCMResourceContext, this.g);
                }
                return this.e;
            }
            if (!this.f) {
                this.f = new Map();
            }
            let item = this.f.get(resource.contextValue);
            if (!item) {
                const contextKeyService = this.g.createOverlay([['scmResourceState', resource.contextValue]]);
                const menu = this.h.createMenu(actions_1.$Ru.SCMResourceContext, contextKeyService);
                item = {
                    menu, dispose() {
                        menu.dispose();
                    }
                };
                this.f.set(resource.contextValue, item);
            }
            return item.menu;
        }
        dispose() {
            this.c?.dispose();
            this.d?.dispose();
            this.e?.dispose();
            if (this.f) {
                (0, lifecycle_1.$fc)(this.f.values());
                this.f.clear();
                this.f = undefined;
            }
        }
    }
    let $LPb = class $LPb {
        get repositoryMenu() {
            if (!this.f) {
                this.f = this.h.createMenu(actions_1.$Ru.SCMSourceControl, this.c);
                this.g.add(this.f);
            }
            return this.f;
        }
        constructor(provider, contextKeyService, instantiationService, h) {
            this.h = h;
            this.d = [];
            this.e = new Map();
            this.g = new lifecycle_1.$jc();
            this.c = contextKeyService.createOverlay([
                ['scmProvider', provider.contextValue],
                ['scmProviderRootUri', provider.rootUri?.toString()],
                ['scmProviderHasRootUri', !!provider.rootUri],
            ]);
            const serviceCollection = new serviceCollection_1.$zh([contextkey_1.$3i, this.c]);
            instantiationService = instantiationService.createChild(serviceCollection);
            this.titleMenu = instantiationService.createInstance($KPb);
            provider.groups.onDidSplice(this.j, this, this.g);
            this.j({ start: 0, deleteCount: 0, toInsert: provider.groups.elements });
        }
        getResourceGroupMenu(group) {
            return this.i(group).resourceGroupMenu;
        }
        getResourceMenu(resource) {
            return this.i(resource.resourceGroup).getResourceMenu(resource);
        }
        getResourceFolderMenu(group) {
            return this.i(group).resourceFolderMenu;
        }
        i(group) {
            let result = this.e.get(group);
            if (!result) {
                const contextKeyService = this.c.createOverlay([
                    ['scmResourceGroup', group.id],
                ]);
                result = new SCMMenusItem(contextKeyService, this.h);
                this.e.set(group, result);
            }
            return result;
        }
        j({ start, deleteCount, toInsert }) {
            const deleted = this.d.splice(start, deleteCount, ...toInsert);
            for (const group of deleted) {
                const item = this.e.get(group);
                item?.dispose();
                this.e.delete(group);
            }
        }
        dispose() {
            this.g.dispose();
            this.e.forEach(item => item.dispose());
        }
    };
    exports.$LPb = $LPb;
    exports.$LPb = $LPb = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, instantiation_1.$Ah),
        __param(3, actions_1.$Su)
    ], $LPb);
    let $MPb = class $MPb {
        constructor(scmService, e) {
            this.e = e;
            this.c = new lifecycle_1.$jc();
            this.d = new Map();
            this.titleMenu = e.createInstance($KPb);
            scmService.onDidRemoveRepository(this.f, this, this.c);
        }
        f(repository) {
            const menus = this.d.get(repository.provider);
            menus?.dispose();
            this.d.delete(repository.provider);
        }
        getRepositoryMenus(provider) {
            let result = this.d.get(provider);
            if (!result) {
                const menus = this.e.createInstance($LPb, provider);
                const dispose = () => {
                    menus.dispose();
                    this.d.delete(provider);
                };
                result = { menus, dispose };
                this.d.set(provider, result);
            }
            return result.menus;
        }
        dispose() {
            this.c.dispose();
        }
    };
    exports.$MPb = $MPb;
    exports.$MPb = $MPb = __decorate([
        __param(0, scm_1.$fI),
        __param(1, instantiation_1.$Ah)
    ], $MPb);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.SCMResourceContext, {
        title: (0, nls_1.localize)(0, null),
        submenu: actions_1.$Ru.SCMResourceContextShare,
        group: '45_share',
        order: 3,
    });
});
//# sourceMappingURL=menus.js.map