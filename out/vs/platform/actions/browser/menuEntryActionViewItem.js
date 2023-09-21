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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/actions", "vs/base/common/keybindingLabels", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/action/common/action", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/theme", "vs/base/common/types", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/browser/defaultStyles", "vs/platform/accessibility/common/accessibility", "vs/css!./menuEntryActionViewItem"], function (require, exports, dom_1, keyboardEvent_1, actionViewItems_1, dropdownActionViewItem_1, actions_1, keybindingLabels_1, lifecycle_1, platform_1, nls_1, actions_2, action_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, storage_1, themeService_1, themables_1, theme_1, types_1, colorRegistry_1, defaultStyles_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createActionViewItem = exports.DropdownWithDefaultActionViewItem = exports.SubmenuEntryActionViewItem = exports.MenuEntryActionViewItem = exports.createAndFillInActionBarActions = exports.createAndFillInContextMenuActions = void 0;
    function createAndFillInContextMenuActions(menu, options, target, primaryGroup) {
        const groups = menu.getActions(options);
        const modifierKeyEmitter = dom_1.ModifierKeyEmitter.getInstance();
        const useAlternativeActions = modifierKeyEmitter.keyStatus.altKey || ((platform_1.isWindows || platform_1.isLinux) && modifierKeyEmitter.keyStatus.shiftKey);
        fillInActions(groups, target, useAlternativeActions, primaryGroup ? actionGroup => actionGroup === primaryGroup : actionGroup => actionGroup === 'navigation');
    }
    exports.createAndFillInContextMenuActions = createAndFillInContextMenuActions;
    function createAndFillInActionBarActions(menu, options, target, primaryGroup, shouldInlineSubmenu, useSeparatorsInPrimaryActions) {
        const groups = menu.getActions(options);
        const isPrimaryAction = typeof primaryGroup === 'string' ? (actionGroup) => actionGroup === primaryGroup : primaryGroup;
        // Action bars handle alternative actions on their own so the alternative actions should be ignored
        fillInActions(groups, target, false, isPrimaryAction, shouldInlineSubmenu, useSeparatorsInPrimaryActions);
    }
    exports.createAndFillInActionBarActions = createAndFillInActionBarActions;
    function fillInActions(groups, target, useAlternativeActions, isPrimaryAction = actionGroup => actionGroup === 'navigation', shouldInlineSubmenu = () => false, useSeparatorsInPrimaryActions = false) {
        let primaryBucket;
        let secondaryBucket;
        if (Array.isArray(target)) {
            primaryBucket = target;
            secondaryBucket = target;
        }
        else {
            primaryBucket = target.primary;
            secondaryBucket = target.secondary;
        }
        const submenuInfo = new Set();
        for (const [group, actions] of groups) {
            let target;
            if (isPrimaryAction(group)) {
                target = primaryBucket;
                if (target.length > 0 && useSeparatorsInPrimaryActions) {
                    target.push(new actions_1.Separator());
                }
            }
            else {
                target = secondaryBucket;
                if (target.length > 0) {
                    target.push(new actions_1.Separator());
                }
            }
            for (let action of actions) {
                if (useAlternativeActions) {
                    action = action instanceof actions_2.MenuItemAction && action.alt ? action.alt : action;
                }
                const newLen = target.push(action);
                // keep submenu info for later inlining
                if (action instanceof actions_1.SubmenuAction) {
                    submenuInfo.add({ group, action, index: newLen - 1 });
                }
            }
        }
        // ask the outside if submenu should be inlined or not. only ask when
        // there would be enough space
        for (const { group, action, index } of submenuInfo) {
            const target = isPrimaryAction(group) ? primaryBucket : secondaryBucket;
            // inlining submenus with length 0 or 1 is easy,
            // larger submenus need to be checked with the overall limit
            const submenuActions = action.actions;
            if (shouldInlineSubmenu(action, group, target.length)) {
                target.splice(index, 1, ...submenuActions);
            }
        }
    }
    let MenuEntryActionViewItem = class MenuEntryActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(action, options, _keybindingService, _notificationService, _contextKeyService, _themeService, _contextMenuService, _accessibilityService) {
            super(undefined, action, { icon: !!(action.class || action.item.icon), label: !action.class && !action.item.icon, draggable: options?.draggable, keybinding: options?.keybinding, hoverDelegate: options?.hoverDelegate });
            this._keybindingService = _keybindingService;
            this._notificationService = _notificationService;
            this._contextKeyService = _contextKeyService;
            this._themeService = _themeService;
            this._contextMenuService = _contextMenuService;
            this._accessibilityService = _accessibilityService;
            this._wantsAltCommand = false;
            this._itemClassDispose = this._register(new lifecycle_1.MutableDisposable());
            this._altKey = dom_1.ModifierKeyEmitter.getInstance();
        }
        get _menuItemAction() {
            return this._action;
        }
        get _commandAction() {
            return this._wantsAltCommand && this._menuItemAction.alt || this._menuItemAction;
        }
        async onClick(event) {
            event.preventDefault();
            event.stopPropagation();
            try {
                await this.actionRunner.run(this._commandAction, this._context);
            }
            catch (err) {
                this._notificationService.error(err);
            }
        }
        render(container) {
            super.render(container);
            container.classList.add('menu-entry');
            if (this.options.icon) {
                this._updateItemClass(this._menuItemAction.item);
            }
            if (this._menuItemAction.alt) {
                let isMouseOver = false;
                const updateAltState = () => {
                    const wantsAltCommand = !!this._menuItemAction.alt?.enabled &&
                        (!this._accessibilityService.isMotionReduced() || isMouseOver) && (this._altKey.keyStatus.altKey ||
                        (this._altKey.keyStatus.shiftKey && isMouseOver));
                    if (wantsAltCommand !== this._wantsAltCommand) {
                        this._wantsAltCommand = wantsAltCommand;
                        this.updateLabel();
                        this.updateTooltip();
                        this.updateClass();
                    }
                };
                this._register(this._altKey.event(updateAltState));
                this._register((0, dom_1.addDisposableListener)(container, 'mouseleave', _ => {
                    isMouseOver = false;
                    updateAltState();
                }));
                this._register((0, dom_1.addDisposableListener)(container, 'mouseenter', _ => {
                    isMouseOver = true;
                    updateAltState();
                }));
                updateAltState();
            }
        }
        updateLabel() {
            if (this.options.label && this.label) {
                this.label.textContent = this._commandAction.label;
            }
        }
        getTooltip() {
            const keybinding = this._keybindingService.lookupKeybinding(this._commandAction.id, this._contextKeyService);
            const keybindingLabel = keybinding && keybinding.getLabel();
            const tooltip = this._commandAction.tooltip || this._commandAction.label;
            let title = keybindingLabel
                ? (0, nls_1.localize)('titleAndKb', "{0} ({1})", tooltip, keybindingLabel)
                : tooltip;
            if (!this._wantsAltCommand && this._menuItemAction.alt?.enabled) {
                const altTooltip = this._menuItemAction.alt.tooltip || this._menuItemAction.alt.label;
                const altKeybinding = this._keybindingService.lookupKeybinding(this._menuItemAction.alt.id, this._contextKeyService);
                const altKeybindingLabel = altKeybinding && altKeybinding.getLabel();
                const altTitleSection = altKeybindingLabel
                    ? (0, nls_1.localize)('titleAndKb', "{0} ({1})", altTooltip, altKeybindingLabel)
                    : altTooltip;
                title = (0, nls_1.localize)('titleAndKbAndAlt', "{0}\n[{1}] {2}", title, keybindingLabels_1.UILabelProvider.modifierLabels[platform_1.OS].altKey, altTitleSection);
            }
            return title;
        }
        updateClass() {
            if (this.options.icon) {
                if (this._commandAction !== this._menuItemAction) {
                    if (this._menuItemAction.alt) {
                        this._updateItemClass(this._menuItemAction.alt.item);
                    }
                }
                else {
                    this._updateItemClass(this._menuItemAction.item);
                }
            }
        }
        _updateItemClass(item) {
            this._itemClassDispose.value = undefined;
            const { element, label } = this;
            if (!element || !label) {
                return;
            }
            const icon = this._commandAction.checked && (0, action_1.isICommandActionToggleInfo)(item.toggled) && item.toggled.icon ? item.toggled.icon : item.icon;
            if (!icon) {
                return;
            }
            if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                // theme icons
                const iconClasses = themables_1.ThemeIcon.asClassNameArray(icon);
                label.classList.add(...iconClasses);
                this._itemClassDispose.value = (0, lifecycle_1.toDisposable)(() => {
                    label.classList.remove(...iconClasses);
                });
            }
            else {
                // icon path/url - add special element with SVG-mask and icon color background
                const svgUrl = (0, theme_1.isDark)(this._themeService.getColorTheme().type)
                    ? (0, dom_1.asCSSUrl)(icon.dark)
                    : (0, dom_1.asCSSUrl)(icon.light);
                const svgIcon = (0, dom_1.$)('span');
                svgIcon.style.webkitMask = svgIcon.style.mask = `${svgUrl} no-repeat 50% 50%`;
                svgIcon.style.background = 'var(--vscode-icon-foreground)';
                svgIcon.style.display = 'inline-block';
                svgIcon.style.width = '100%';
                svgIcon.style.height = '100%';
                label.appendChild(svgIcon);
                label.classList.add('icon');
                this._itemClassDispose.value = (0, lifecycle_1.combinedDisposable)((0, lifecycle_1.toDisposable)(() => {
                    label.classList.remove('icon');
                    (0, dom_1.reset)(label);
                }), this._themeService.onDidColorThemeChange(() => {
                    // refresh when the theme changes in case we go between dark <-> light
                    this.updateClass();
                }));
            }
        }
    };
    exports.MenuEntryActionViewItem = MenuEntryActionViewItem;
    exports.MenuEntryActionViewItem = MenuEntryActionViewItem = __decorate([
        __param(2, keybinding_1.IKeybindingService),
        __param(3, notification_1.INotificationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, themeService_1.IThemeService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, accessibility_1.IAccessibilityService)
    ], MenuEntryActionViewItem);
    let SubmenuEntryActionViewItem = class SubmenuEntryActionViewItem extends dropdownActionViewItem_1.DropdownMenuActionViewItem {
        constructor(action, options, _keybindingService, _contextMenuService, _themeService) {
            const dropdownOptions = {
                ...options,
                menuAsChild: options?.menuAsChild ?? false,
                classNames: options?.classNames ?? (themables_1.ThemeIcon.isThemeIcon(action.item.icon) ? themables_1.ThemeIcon.asClassName(action.item.icon) : undefined),
                keybindingProvider: options?.keybindingProvider ?? (action => _keybindingService.lookupKeybinding(action.id))
            };
            super(action, { getActions: () => action.actions }, _contextMenuService, dropdownOptions);
            this._keybindingService = _keybindingService;
            this._contextMenuService = _contextMenuService;
            this._themeService = _themeService;
        }
        render(container) {
            super.render(container);
            (0, types_1.assertType)(this.element);
            container.classList.add('menu-entry');
            const action = this._action;
            const { icon } = action.item;
            if (icon && !themables_1.ThemeIcon.isThemeIcon(icon)) {
                this.element.classList.add('icon');
                const setBackgroundImage = () => {
                    if (this.element) {
                        this.element.style.backgroundImage = ((0, theme_1.isDark)(this._themeService.getColorTheme().type)
                            ? (0, dom_1.asCSSUrl)(icon.dark)
                            : (0, dom_1.asCSSUrl)(icon.light));
                    }
                };
                setBackgroundImage();
                this._register(this._themeService.onDidColorThemeChange(() => {
                    // refresh when the theme changes in case we go between dark <-> light
                    setBackgroundImage();
                }));
            }
        }
    };
    exports.SubmenuEntryActionViewItem = SubmenuEntryActionViewItem;
    exports.SubmenuEntryActionViewItem = SubmenuEntryActionViewItem = __decorate([
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, themeService_1.IThemeService)
    ], SubmenuEntryActionViewItem);
    let DropdownWithDefaultActionViewItem = class DropdownWithDefaultActionViewItem extends actionViewItems_1.BaseActionViewItem {
        get onDidChangeDropdownVisibility() {
            return this._dropdown.onDidChangeVisibility;
        }
        constructor(submenuAction, options, _keybindingService, _notificationService, _contextMenuService, _menuService, _instaService, _storageService) {
            super(null, submenuAction);
            this._keybindingService = _keybindingService;
            this._notificationService = _notificationService;
            this._contextMenuService = _contextMenuService;
            this._menuService = _menuService;
            this._instaService = _instaService;
            this._storageService = _storageService;
            this._container = null;
            this._options = options;
            this._storageKey = `${submenuAction.item.submenu.id}_lastActionId`;
            // determine default action
            let defaultAction;
            const defaultActionId = options?.persistLastActionId ? _storageService.get(this._storageKey, 1 /* StorageScope.WORKSPACE */) : undefined;
            if (defaultActionId) {
                defaultAction = submenuAction.actions.find(a => defaultActionId === a.id);
            }
            if (!defaultAction) {
                defaultAction = submenuAction.actions[0];
            }
            this._defaultAction = this._instaService.createInstance(MenuEntryActionViewItem, defaultAction, { keybinding: this._getDefaultActionKeybindingLabel(defaultAction) });
            const dropdownOptions = {
                keybindingProvider: action => this._keybindingService.lookupKeybinding(action.id),
                ...options,
                menuAsChild: options?.menuAsChild ?? true,
                classNames: options?.classNames ?? ['codicon', 'codicon-chevron-down'],
                actionRunner: options?.actionRunner ?? new actions_1.ActionRunner(),
            };
            this._dropdown = new dropdownActionViewItem_1.DropdownMenuActionViewItem(submenuAction, submenuAction.actions, this._contextMenuService, dropdownOptions);
            this._dropdown.actionRunner.onDidRun((e) => {
                if (e.action instanceof actions_2.MenuItemAction) {
                    this.update(e.action);
                }
            });
        }
        update(lastAction) {
            if (this._options?.persistLastActionId) {
                this._storageService.store(this._storageKey, lastAction.id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            this._defaultAction.dispose();
            this._defaultAction = this._instaService.createInstance(MenuEntryActionViewItem, lastAction, { keybinding: this._getDefaultActionKeybindingLabel(lastAction) });
            this._defaultAction.actionRunner = new class extends actions_1.ActionRunner {
                async runAction(action, context) {
                    await action.run(undefined);
                }
            }();
            if (this._container) {
                this._defaultAction.render((0, dom_1.prepend)(this._container, (0, dom_1.$)('.action-container')));
            }
        }
        _getDefaultActionKeybindingLabel(defaultAction) {
            let defaultActionKeybinding;
            if (this._options?.renderKeybindingWithDefaultActionLabel) {
                const kb = this._keybindingService.lookupKeybinding(defaultAction.id);
                if (kb) {
                    defaultActionKeybinding = `(${kb.getLabel()})`;
                }
            }
            return defaultActionKeybinding;
        }
        setActionContext(newContext) {
            super.setActionContext(newContext);
            this._defaultAction.setActionContext(newContext);
            this._dropdown.setActionContext(newContext);
        }
        render(container) {
            this._container = container;
            super.render(this._container);
            this._container.classList.add('monaco-dropdown-with-default');
            const primaryContainer = (0, dom_1.$)('.action-container');
            this._defaultAction.render((0, dom_1.append)(this._container, primaryContainer));
            this._register((0, dom_1.addDisposableListener)(primaryContainer, dom_1.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(17 /* KeyCode.RightArrow */)) {
                    this._defaultAction.element.tabIndex = -1;
                    this._dropdown.focus();
                    event.stopPropagation();
                }
            }));
            const dropdownContainer = (0, dom_1.$)('.dropdown-action-container');
            this._dropdown.render((0, dom_1.append)(this._container, dropdownContainer));
            this._register((0, dom_1.addDisposableListener)(dropdownContainer, dom_1.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    this._defaultAction.element.tabIndex = 0;
                    this._dropdown.setFocusable(false);
                    this._defaultAction.element?.focus();
                    event.stopPropagation();
                }
            }));
        }
        focus(fromRight) {
            if (fromRight) {
                this._dropdown.focus();
            }
            else {
                this._defaultAction.element.tabIndex = 0;
                this._defaultAction.element.focus();
            }
        }
        blur() {
            this._defaultAction.element.tabIndex = -1;
            this._dropdown.blur();
            this._container.blur();
        }
        setFocusable(focusable) {
            if (focusable) {
                this._defaultAction.element.tabIndex = 0;
            }
            else {
                this._defaultAction.element.tabIndex = -1;
                this._dropdown.setFocusable(false);
            }
        }
        dispose() {
            this._defaultAction.dispose();
            this._dropdown.dispose();
            super.dispose();
        }
    };
    exports.DropdownWithDefaultActionViewItem = DropdownWithDefaultActionViewItem;
    exports.DropdownWithDefaultActionViewItem = DropdownWithDefaultActionViewItem = __decorate([
        __param(2, keybinding_1.IKeybindingService),
        __param(3, notification_1.INotificationService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, actions_2.IMenuService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, storage_1.IStorageService)
    ], DropdownWithDefaultActionViewItem);
    let SubmenuEntrySelectActionViewItem = class SubmenuEntrySelectActionViewItem extends actionViewItems_1.SelectActionViewItem {
        constructor(action, contextViewService) {
            super(null, action, action.actions.map(a => ({
                text: a.id === actions_1.Separator.ID ? '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500' : a.label,
                isDisabled: !a.enabled,
            })), 0, contextViewService, defaultStyles_1.defaultSelectBoxStyles, { ariaLabel: action.tooltip, optionsAsChildren: true });
            this.select(Math.max(0, action.actions.findIndex(a => a.checked)));
        }
        render(container) {
            super.render(container);
            container.style.borderColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.selectBorder);
        }
        runAction(option, index) {
            const action = this.action.actions[index];
            if (action) {
                this.actionRunner.run(action);
            }
        }
    };
    SubmenuEntrySelectActionViewItem = __decorate([
        __param(1, contextView_1.IContextViewService)
    ], SubmenuEntrySelectActionViewItem);
    /**
     * Creates action view items for menu actions or submenu actions.
     */
    function createActionViewItem(instaService, action, options) {
        if (action instanceof actions_2.MenuItemAction) {
            return instaService.createInstance(MenuEntryActionViewItem, action, options);
        }
        else if (action instanceof actions_2.SubmenuItemAction) {
            if (action.item.isSelection) {
                return instaService.createInstance(SubmenuEntrySelectActionViewItem, action);
            }
            else {
                if (action.item.rememberDefaultAction) {
                    return instaService.createInstance(DropdownWithDefaultActionViewItem, action, { ...options, persistLastActionId: true });
                }
                else {
                    return instaService.createInstance(SubmenuEntryActionViewItem, action, options);
                }
            }
        }
        else {
            return undefined;
        }
    }
    exports.createActionViewItem = createActionViewItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudUVudHJ5QWN0aW9uVmlld0l0ZW0uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9hY3Rpb25zL2Jyb3dzZXIvbWVudUVudHJ5QWN0aW9uVmlld0l0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBK0JoRyxTQUFnQixpQ0FBaUMsQ0FBQyxJQUFXLEVBQUUsT0FBdUMsRUFBRSxNQUFnRSxFQUFFLFlBQXFCO1FBQzlMLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsTUFBTSxrQkFBa0IsR0FBRyx3QkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1RCxNQUFNLHFCQUFxQixHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLG9CQUFTLElBQUksa0JBQU8sQ0FBQyxJQUFJLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2SSxhQUFhLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsV0FBVyxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEtBQUssWUFBWSxDQUFDLENBQUM7SUFDaEssQ0FBQztJQUxELDhFQUtDO0lBRUQsU0FBZ0IsK0JBQStCLENBQzlDLElBQVcsRUFDWCxPQUF1QyxFQUN2QyxNQUFnRSxFQUNoRSxZQUEwRCxFQUMxRCxtQkFBMEYsRUFDMUYsNkJBQXVDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsTUFBTSxlQUFlLEdBQUcsT0FBTyxZQUFZLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxD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