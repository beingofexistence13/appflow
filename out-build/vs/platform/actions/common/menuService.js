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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/actions", "vs/platform/storage/common/storage", "vs/base/common/arrays", "vs/nls!vs/platform/actions/common/menuService"], function (require, exports, async_1, event_1, lifecycle_1, actions_1, commands_1, contextkey_1, actions_2, storage_1, arrays_1, nls_1) {
    "use strict";
    var PersistedMenuHideState_1, MenuInfo_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lyb = void 0;
    let $lyb = class $lyb {
        constructor(d, storageService) {
            this.d = d;
            this.c = new PersistedMenuHideState(storageService);
        }
        createMenu(id, contextKeyService, options) {
            return new MenuImpl(id, this.c, { emitEventsForSubmenuChanges: false, eventDebounceDelay: 50, ...options }, this.d, contextKeyService);
        }
        resetHiddenStates(ids) {
            this.c.reset(ids);
        }
    };
    exports.$lyb = $lyb;
    exports.$lyb = $lyb = __decorate([
        __param(0, commands_1.$Fr),
        __param(1, storage_1.$Vo)
    ], $lyb);
    let PersistedMenuHideState = class PersistedMenuHideState {
        static { PersistedMenuHideState_1 = this; }
        static { this.c = 'menu.hiddenCommands'; }
        constructor(k) {
            this.k = k;
            this.d = new lifecycle_1.$jc();
            this.f = new event_1.$fd();
            this.onDidChange = this.f.event;
            this.h = false;
            this.j = new Map();
            try {
                const raw = k.get(PersistedMenuHideState_1.c, 0 /* StorageScope.PROFILE */, '{}');
                this.i = JSON.parse(raw);
            }
            catch (err) {
                this.i = Object.create(null);
            }
            this.d.add(k.onDidChangeValue(0 /* StorageScope.PROFILE */, PersistedMenuHideState_1.c, this.d)(() => {
                if (!this.h) {
                    try {
                        const raw = k.get(PersistedMenuHideState_1.c, 0 /* StorageScope.PROFILE */, '{}');
                        this.i = JSON.parse(raw);
                    }
                    catch (err) {
                        console.log('FAILED to read storage after UPDATE', err);
                    }
                }
                this.f.fire();
            }));
        }
        dispose() {
            this.f.dispose();
            this.d.dispose();
        }
        l(menu, commandId) {
            return this.j.get(`${menu.id}/${commandId}`) ?? false;
        }
        setDefaultState(menu, commandId, hidden) {
            this.j.set(`${menu.id}/${commandId}`, hidden);
        }
        isHidden(menu, commandId) {
            const hiddenByDefault = this.l(menu, commandId);
            const state = this.i[menu.id]?.includes(commandId) ?? false;
            return hiddenByDefault ? !state : state;
        }
        updateHidden(menu, commandId, hidden) {
            const hiddenByDefault = this.l(menu, commandId);
            if (hiddenByDefault) {
                hidden = !hidden;
            }
            const entries = this.i[menu.id];
            if (!hidden) {
                // remove and cleanup
                if (entries) {
                    const idx = entries.indexOf(commandId);
                    if (idx >= 0) {
                        (0, arrays_1.$tb)(entries, idx);
                    }
                    if (entries.length === 0) {
                        delete this.i[menu.id];
                    }
                }
            }
            else {
                // add unless already added
                if (!entries) {
                    this.i[menu.id] = [commandId];
                }
                else {
                    const idx = entries.indexOf(commandId);
                    if (idx < 0) {
                        entries.push(commandId);
                    }
                }
            }
            this.m();
        }
        reset(menus) {
            if (menus === undefined) {
                // reset all
                this.i = Object.create(null);
                this.m();
            }
            else {
                // reset only for a specific menu
                for (const { id } of menus) {
                    if (this.i[id]) {
                        delete this.i[id];
                    }
                }
                this.m();
            }
        }
        m() {
            try {
                this.h = true;
                const raw = JSON.stringify(this.i);
                this.k.store(PersistedMenuHideState_1.c, raw, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
            finally {
                this.h = false;
            }
        }
    };
    PersistedMenuHideState = PersistedMenuHideState_1 = __decorate([
        __param(0, storage_1.$Vo)
    ], PersistedMenuHideState);
    let MenuInfo = MenuInfo_1 = class MenuInfo {
        constructor(i, j, k, l, m) {
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.m = m;
            this.c = [];
            this.d = new Set();
            this.f = new Set();
            this.h = new Set();
            this.refresh();
        }
        get structureContextKeys() {
            return this.d;
        }
        get preconditionContextKeys() {
            return this.f;
        }
        get toggledContextKeys() {
            return this.h;
        }
        refresh() {
            // reset
            this.c.length = 0;
            this.d.clear();
            this.f.clear();
            this.h.clear();
            const menuItems = actions_1.$Tu.getMenuItems(this.i);
            let group;
            menuItems.sort(MenuInfo_1.p);
            for (const item of menuItems) {
                // group by groupId
                const groupName = item.group || '';
                if (!group || group[0] !== groupName) {
                    group = [groupName, []];
                    this.c.push(group);
                }
                group[1].push(item);
                // keep keys for eventing
                this.n(item);
            }
        }
        n(item) {
            MenuInfo_1.o(item.when, this.d);
            if ((0, actions_1.$Pu)(item)) {
                // keep precondition keys for event if applicable
                if (item.command.precondition) {
                    MenuInfo_1.o(item.command.precondition, this.f);
                }
                // keep toggled keys for event if applicable
                if (item.command.toggled) {
                    const toggledExpression = item.command.toggled.condition || item.command.toggled;
                    MenuInfo_1.o(toggledExpression, this.h);
                }
            }
            else if (this.k) {
                // recursively collect context keys from submenus so that this
                // menu fires events when context key changes affect submenus
                actions_1.$Tu.getMenuItems(item.submenu).forEach(this.n, this);
            }
        }
        createActionGroups(options) {
            const result = [];
            for (const group of this.c) {
                const [id, items] = group;
                const activeActions = [];
                for (const item of items) {
                    if (this.m.contextMatchesRules(item.when)) {
                        const isMenuItem = (0, actions_1.$Pu)(item);
                        if (isMenuItem) {
                            this.j.setDefaultState(this.i, item.command.id, !!item.isHiddenByDefault);
                        }
                        const menuHide = createMenuHide(this.i, isMenuItem ? item.command : item, this.j);
                        if (isMenuItem) {
                            // MenuItemAction
                            activeActions.push(new actions_1.$Vu(item.command, item.alt, options, menuHide, this.m, this.l));
                        }
                        else {
                            // SubmenuItemAction
                            const groups = new MenuInfo_1(item.submenu, this.j, this.k, this.l, this.m).createActionGroups(options);
                            const submenuActions = actions_2.$ii.join(...groups.map(g => g[1]));
                            if (submenuActions.length > 0) {
                                activeActions.push(new actions_1.$Uu(item, menuHide, submenuActions));
                            }
                        }
                    }
                }
                if (activeActions.length > 0) {
                    result.push([id, activeActions]);
                }
            }
            return result;
        }
        static o(exp, set) {
            if (exp) {
                for (const key of exp.keys()) {
                    set.add(key);
                }
            }
        }
        static p(a, b) {
            const aGroup = a.group;
            const bGroup = b.group;
            if (aGroup !== bGroup) {
                // Falsy groups come last
                if (!aGroup) {
                    return 1;
                }
                else if (!bGroup) {
                    return -1;
                }
                // 'navigation' group comes first
                if (aGroup === 'navigation') {
                    return -1;
                }
                else if (bGroup === 'navigation') {
                    return 1;
                }
                // lexical sort for groups
                const value = aGroup.localeCompare(bGroup);
                if (value !== 0) {
                    return value;
                }
            }
            // sort on priority - default is 0
            const aPrio = a.order || 0;
            const bPrio = b.order || 0;
            if (aPrio < bPrio) {
                return -1;
            }
            else if (aPrio > bPrio) {
                return 1;
            }
            // sort on titles
            return MenuInfo_1.q((0, actions_1.$Pu)(a) ? a.command.title : a.title, (0, actions_1.$Pu)(b) ? b.command.title : b.title);
        }
        static q(a, b) {
            const aStr = typeof a === 'string' ? a : a.original;
            const bStr = typeof b === 'string' ? b : b.original;
            return aStr.localeCompare(bStr);
        }
    };
    MenuInfo = MenuInfo_1 = __decorate([
        __param(3, commands_1.$Fr),
        __param(4, contextkey_1.$3i)
    ], MenuInfo);
    let MenuImpl = class MenuImpl {
        constructor(id, hiddenStates, options, commandService, contextKeyService) {
            this.d = new lifecycle_1.$jc();
            this.c = new MenuInfo(id, hiddenStates, options.emitEventsForSubmenuChanges, commandService, contextKeyService);
            // Rebuild this menu whenever the menu registry reports an event for this MenuId.
            // This usually happen while code and extensions are loaded and affects the over
            // structure of the menu
            const rebuildMenuSoon = new async_1.$Sg(() => {
                this.c.refresh();
                this.f.fire({ menu: this, isStructuralChange: true, isEnablementChange: true, isToggleChange: true });
            }, options.eventDebounceDelay);
            this.d.add(rebuildMenuSoon);
            this.d.add(actions_1.$Tu.onDidChangeMenu(e => {
                if (e.has(id)) {
                    rebuildMenuSoon.schedule();
                }
            }));
            // When context keys or storage state changes we need to check if the menu also has changed. However,
            // we only do that when someone listens on this menu because (1) these events are
            // firing often and (2) menu are often leaked
            const lazyListener = this.d.add(new lifecycle_1.$jc());
            const merge = (events) => {
                let isStructuralChange = false;
                let isEnablementChange = false;
                let isToggleChange = false;
                for (const item of events) {
                    isStructuralChange = isStructuralChange || item.isStructuralChange;
                    isEnablementChange = isEnablementChange || item.isEnablementChange;
                    isToggleChange = isToggleChange || item.isToggleChange;
                    if (isStructuralChange && isEnablementChange && isToggleChange) {
                        // everything is TRUE, no need to continue iterating
                        break;
                    }
                }
                return { menu: this, isStructuralChange, isEnablementChange, isToggleChange };
            };
            const startLazyListener = () => {
                lazyListener.add(contextKeyService.onDidChangeContext(e => {
                    const isStructuralChange = e.affectsSome(this.c.structureContextKeys);
                    const isEnablementChange = e.affectsSome(this.c.preconditionContextKeys);
                    const isToggleChange = e.affectsSome(this.c.toggledContextKeys);
                    if (isStructuralChange || isEnablementChange || isToggleChange) {
                        this.f.fire({ menu: this, isStructuralChange, isEnablementChange, isToggleChange });
                    }
                }));
                lazyListener.add(hiddenStates.onDidChange(e => {
                    this.f.fire({ menu: this, isStructuralChange: true, isEnablementChange: false, isToggleChange: false });
                }));
            };
            this.f = new event_1.$jd({
                // start/stop context key listener
                onWillAddFirstListener: startLazyListener,
                onDidRemoveLastListener: lazyListener.clear.bind(lazyListener),
                delay: options.eventDebounceDelay,
                merge
            });
            this.onDidChange = this.f.event;
        }
        getActions(options) {
            return this.c.createActionGroups(options);
        }
        dispose() {
            this.d.dispose();
            this.f.dispose();
        }
    };
    MenuImpl = __decorate([
        __param(3, commands_1.$Fr),
        __param(4, contextkey_1.$3i)
    ], MenuImpl);
    function createMenuHide(menu, command, states) {
        const id = (0, actions_1.$Qu)(command) ? command.submenu.id : command.id;
        const title = typeof command.title === 'string' ? command.title : command.title.value;
        const hide = (0, actions_2.$li)({
            id: `hide/${menu.id}/${id}`,
            label: (0, nls_1.localize)(0, null, title),
            run() { states.updateHidden(menu, id, true); }
        });
        const toggle = (0, actions_2.$li)({
            id: `toggle/${menu.id}/${id}`,
            label: title,
            get checked() { return !states.isHidden(menu, id); },
            run() { states.updateHidden(menu, id, !!this.checked); }
        });
        return {
            hide,
            toggle,
            get isHidden() { return !toggle.checked; },
        };
    }
});
//# sourceMappingURL=menuService.js.map