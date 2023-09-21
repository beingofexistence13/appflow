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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/actions", "vs/platform/storage/common/storage", "vs/base/common/arrays", "vs/nls"], function (require, exports, async_1, event_1, lifecycle_1, actions_1, commands_1, contextkey_1, actions_2, storage_1, arrays_1, nls_1) {
    "use strict";
    var PersistedMenuHideState_1, MenuInfo_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuService = void 0;
    let MenuService = class MenuService {
        constructor(_commandService, storageService) {
            this._commandService = _commandService;
            this._hiddenStates = new PersistedMenuHideState(storageService);
        }
        createMenu(id, contextKeyService, options) {
            return new MenuImpl(id, this._hiddenStates, { emitEventsForSubmenuChanges: false, eventDebounceDelay: 50, ...options }, this._commandService, contextKeyService);
        }
        resetHiddenStates(ids) {
            this._hiddenStates.reset(ids);
        }
    };
    exports.MenuService = MenuService;
    exports.MenuService = MenuService = __decorate([
        __param(0, commands_1.ICommandService),
        __param(1, storage_1.IStorageService)
    ], MenuService);
    let PersistedMenuHideState = class PersistedMenuHideState {
        static { PersistedMenuHideState_1 = this; }
        static { this._key = 'menu.hiddenCommands'; }
        constructor(_storageService) {
            this._storageService = _storageService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._ignoreChangeEvent = false;
            this._hiddenByDefaultCache = new Map();
            try {
                const raw = _storageService.get(PersistedMenuHideState_1._key, 0 /* StorageScope.PROFILE */, '{}');
                this._data = JSON.parse(raw);
            }
            catch (err) {
                this._data = Object.create(null);
            }
            this._disposables.add(_storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, PersistedMenuHideState_1._key, this._disposables)(() => {
                if (!this._ignoreChangeEvent) {
                    try {
                        const raw = _storageService.get(PersistedMenuHideState_1._key, 0 /* StorageScope.PROFILE */, '{}');
                        this._data = JSON.parse(raw);
                    }
                    catch (err) {
                        console.log('FAILED to read storage after UPDATE', err);
                    }
                }
                this._onDidChange.fire();
            }));
        }
        dispose() {
            this._onDidChange.dispose();
            this._disposables.dispose();
        }
        _isHiddenByDefault(menu, commandId) {
            return this._hiddenByDefaultCache.get(`${menu.id}/${commandId}`) ?? false;
        }
        setDefaultState(menu, commandId, hidden) {
            this._hiddenByDefaultCache.set(`${menu.id}/${commandId}`, hidden);
        }
        isHidden(menu, commandId) {
            const hiddenByDefault = this._isHiddenByDefault(menu, commandId);
            const state = this._data[menu.id]?.includes(commandId) ?? false;
            return hiddenByDefault ? !state : state;
        }
        updateHidden(menu, commandId, hidden) {
            const hiddenByDefault = this._isHiddenByDefault(menu, commandId);
            if (hiddenByDefault) {
                hidden = !hidden;
            }
            const entries = this._data[menu.id];
            if (!hidden) {
                // remove and cleanup
                if (entries) {
                    const idx = entries.indexOf(commandId);
                    if (idx >= 0) {
                        (0, arrays_1.removeFastWithoutKeepingOrder)(entries, idx);
                    }
                    if (entries.length === 0) {
                        delete this._data[menu.id];
                    }
                }
            }
            else {
                // add unless already added
                if (!entries) {
                    this._data[menu.id] = [commandId];
                }
                else {
                    const idx = entries.indexOf(commandId);
                    if (idx < 0) {
                        entries.push(commandId);
                    }
                }
            }
            this._persist();
        }
        reset(menus) {
            if (menus === undefined) {
                // reset all
                this._data = Object.create(null);
                this._persist();
            }
            else {
                // reset only for a specific menu
                for (const { id } of menus) {
                    if (this._data[id]) {
                        delete this._data[id];
                    }
                }
                this._persist();
            }
        }
        _persist() {
            try {
                this._ignoreChangeEvent = true;
                const raw = JSON.stringify(this._data);
                this._storageService.store(PersistedMenuHideState_1._key, raw, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            }
            finally {
                this._ignoreChangeEvent = false;
            }
        }
    };
    PersistedMenuHideState = PersistedMenuHideState_1 = __decorate([
        __param(0, storage_1.IStorageService)
    ], PersistedMenuHideState);
    let MenuInfo = MenuInfo_1 = class MenuInfo {
        constructor(_id, _hiddenStates, _collectContextKeysForSubmenus, _commandService, _contextKeyService) {
            this._id = _id;
            this._hiddenStates = _hiddenStates;
            this._collectContextKeysForSubmenus = _collectContextKeysForSubmenus;
            this._commandService = _commandService;
            this._contextKeyService = _contextKeyService;
            this._menuGroups = [];
            this._structureContextKeys = new Set();
            this._preconditionContextKeys = new Set();
            this._toggledContextKeys = new Set();
            this.refresh();
        }
        get structureContextKeys() {
            return this._structureContextKeys;
        }
        get preconditionContextKeys() {
            return this._preconditionContextKeys;
        }
        get toggledContextKeys() {
            return this._toggledContextKeys;
        }
        refresh() {
            // reset
            this._menuGroups.length = 0;
            this._structureContextKeys.clear();
            this._preconditionContextKeys.clear();
            this._toggledContextKeys.clear();
            const menuItems = actions_1.MenuRegistry.getMenuItems(this._id);
            let group;
            menuItems.sort(MenuInfo_1._compareMenuItems);
            for (const item of menuItems) {
                // group by groupId
                const groupName = item.group || '';
                if (!group || group[0] !== groupName) {
                    group = [groupName, []];
                    this._menuGroups.push(group);
                }
                group[1].push(item);
                // keep keys for eventing
                this._collectContextKeys(item);
            }
        }
        _collectContextKeys(item) {
            MenuInfo_1._fillInKbExprKeys(item.when, this._structureContextKeys);
            if ((0, actions_1.isIMenuItem)(item)) {
                // keep precondition keys for event if applicable
                if (item.command.precondition) {
                    MenuInfo_1._fillInKbExprKeys(item.command.precondition, this._preconditionContextKeys);
                }
                // keep toggled keys for event if applicable
                if (item.command.toggled) {
                    const toggledExpression = item.command.toggled.condition || item.command.toggled;
                    MenuInfo_1._fillInKbExprKeys(toggledExpression, this._toggledContextKeys);
                }
            }
            else if (this._collectContextKeysForSubmenus) {
                // recursively collect context keys from submenus so that this
                // menu fires events when context key changes affect submenus
                actions_1.MenuRegistry.getMenuItems(item.submenu).forEach(this._collectContextKeys, this);
            }
        }
        createActionGroups(options) {
            const result = [];
            for (const group of this._menuGroups) {
                const [id, items] = group;
                const activeActions = [];
                for (const item of items) {
                    if (this._contextKeyService.contextMatchesRules(item.when)) {
                        const isMenuItem = (0, actions_1.isIMenuItem)(item);
                        if (isMenuItem) {
                            this._hiddenStates.setDefaultState(this._id, item.command.id, !!item.isHiddenByDefault);
                        }
                        const menuHide = createMenuHide(this._id, isMenuItem ? item.command : item, this._hiddenStates);
                        if (isMenuItem) {
                            // MenuItemAction
                            activeActions.push(new actions_1.MenuItemAction(item.command, item.alt, options, menuHide, this._contextKeyService, this._commandService));
                        }
                        else {
                            // SubmenuItemAction
                            const groups = new MenuInfo_1(item.submenu, this._hiddenStates, this._collectContextKeysForSubmenus, this._commandService, this._contextKeyService).createActionGroups(options);
                            const submenuActions = actions_2.Separator.join(...groups.map(g => g[1]));
                            if (submenuActions.length > 0) {
                                activeActions.push(new actions_1.SubmenuItemAction(item, menuHide, submenuActions));
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
        static _fillInKbExprKeys(exp, set) {
            if (exp) {
                for (const key of exp.keys()) {
                    set.add(key);
                }
            }
        }
        static _compareMenuItems(a, b) {
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
            return MenuInfo_1._compareTitles((0, actions_1.isIMenuItem)(a) ? a.command.title : a.title, (0, actions_1.isIMenuItem)(b) ? b.command.title : b.title);
        }
        static _compareTitles(a, b) {
            const aStr = typeof a === 'string' ? a : a.original;
            const bStr = typeof b === 'string' ? b : b.original;
            return aStr.localeCompare(bStr);
        }
    };
    MenuInfo = MenuInfo_1 = __decorate([
        __param(3, commands_1.ICommandService),
        __param(4, contextkey_1.IContextKeyService)
    ], MenuInfo);
    let MenuImpl = class MenuImpl {
        constructor(id, hiddenStates, options, commandService, contextKeyService) {
            this._disposables = new lifecycle_1.DisposableStore();
            this._menuInfo = new MenuInfo(id, hiddenStates, options.emitEventsForSubmenuChanges, commandService, contextKeyService);
            // Rebuild this menu whenever the menu registry reports an event for this MenuId.
            // This usually happen while code and extensions are loaded and affects the over
            // structure of the menu
            const rebuildMenuSoon = new async_1.RunOnceScheduler(() => {
                this._menuInfo.refresh();
                this._onDidChange.fire({ menu: this, isStructuralChange: true, isEnablementChange: true, isToggleChange: true });
            }, options.eventDebounceDelay);
            this._disposables.add(rebuildMenuSoon);
            this._disposables.add(actions_1.MenuRegistry.onDidChangeMenu(e => {
                if (e.has(id)) {
                    rebuildMenuSoon.schedule();
                }
            }));
            // When context keys or storage state changes we need to check if the menu also has changed. However,
            // we only do that when someone listens on this menu because (1) these events are
            // firing often and (2) menu are often leaked
            const lazyListener = this._disposables.add(new lifecycle_1.DisposableStore());
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
                    const isStructuralChange = e.affectsSome(this._menuInfo.structureContextKeys);
                    const isEnablementChange = e.affectsSome(this._menuInfo.preconditionContextKeys);
                    const isToggleChange = e.affectsSome(this._menuInfo.toggledContextKeys);
                    if (isStructuralChange || isEnablementChange || isToggleChange) {
                        this._onDidChange.fire({ menu: this, isStructuralChange, isEnablementChange, isToggleChange });
                    }
                }));
                lazyListener.add(hiddenStates.onDidChange(e => {
                    this._onDidChange.fire({ menu: this, isStructuralChange: true, isEnablementChange: false, isToggleChange: false });
                }));
            };
            this._onDidChange = new event_1.DebounceEmitter({
                // start/stop context key listener
                onWillAddFirstListener: startLazyListener,
                onDidRemoveLastListener: lazyListener.clear.bind(lazyListener),
                delay: options.eventDebounceDelay,
                merge
            });
            this.onDidChange = this._onDidChange.event;
        }
        getActions(options) {
            return this._menuInfo.createActionGroups(options);
        }
        dispose() {
            this._disposables.dispose();
            this._onDidChange.dispose();
        }
    };
    MenuImpl = __decorate([
        __param(3, commands_1.ICommandService),
        __param(4, contextkey_1.IContextKeyService)
    ], MenuImpl);
    function createMenuHide(menu, command, states) {
        const id = (0, actions_1.isISubmenuItem)(command) ? command.submenu.id : command.id;
        const title = typeof command.title === 'string' ? command.title : command.title.value;
        const hide = (0, actions_2.toAction)({
            id: `hide/${menu.id}/${id}`,
            label: (0, nls_1.localize)('hide.label', 'Hide \'{0}\'', title),
            run() { states.updateHidden(menu, id, true); }
        });
        const toggle = (0, actions_2.toAction)({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hY3Rpb25zL2NvbW1vbi9tZW51U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBY3pGLElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQVc7UUFNdkIsWUFDbUMsZUFBZ0MsRUFDakQsY0FBK0I7WUFEZCxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFHbEUsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFRCxVQUFVLENBQUMsRUFBVSxFQUFFLGlCQUFxQyxFQUFFLE9BQTRCO1lBQ3pGLE9BQU8sSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSwyQkFBMkIsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2xLLENBQUM7UUFFRCxpQkFBaUIsQ0FBQyxHQUFjO1lBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLENBQUM7S0FDRCxDQUFBO0lBcEJZLGtDQUFXOzBCQUFYLFdBQVc7UUFPckIsV0FBQSwwQkFBZSxDQUFBO1FBQ2YsV0FBQSx5QkFBZSxDQUFBO09BUkwsV0FBVyxDQW9CdkI7SUFFRCxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUFzQjs7aUJBRUgsU0FBSSxHQUFHLHFCQUFxQixBQUF4QixDQUF5QjtRQVdyRCxZQUE2QixlQUFpRDtZQUFoQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFUN0QsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNy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