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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/actions", "vs/base/common/keybindingLabels", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls!vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/action/common/action", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/theme", "vs/base/common/types", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/browser/defaultStyles", "vs/platform/accessibility/common/accessibility", "vs/css!./menuEntryActionViewItem"], function (require, exports, dom_1, keyboardEvent_1, actionViewItems_1, dropdownActionViewItem_1, actions_1, keybindingLabels_1, lifecycle_1, platform_1, nls_1, actions_2, action_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, storage_1, themeService_1, themables_1, theme_1, types_1, colorRegistry_1, defaultStyles_1, accessibility_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$F3 = exports.$E3 = exports.$D3 = exports.$C3 = exports.$B3 = exports.$A3 = void 0;
    function $A3(menu, options, target, primaryGroup) {
        const groups = menu.getActions(options);
        const modifierKeyEmitter = dom_1.$xP.getInstance();
        const useAlternativeActions = modifierKeyEmitter.keyStatus.altKey || ((platform_1.$i || platform_1.$k) && modifierKeyEmitter.keyStatus.shiftKey);
        fillInActions(groups, target, useAlternativeActions, primaryGroup ? actionGroup => actionGroup === primaryGroup : actionGroup => actionGroup === 'navigation');
    }
    exports.$A3 = $A3;
    function $B3(menu, options, target, primaryGroup, shouldInlineSubmenu, useSeparatorsInPrimaryActions) {
        const groups = menu.getActions(options);
        const isPrimaryAction = typeof primaryGroup === 'string' ? (actionGroup) => actionGroup === primaryGroup : primaryGroup;
        // Action bars handle alternative actions on their own so the alternative actions should be ignored
        fillInActions(groups, target, false, isPrimaryAction, shouldInlineSubmenu, useSeparatorsInPrimaryActions);
    }
    exports.$B3 = $B3;
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
                    target.push(new actions_1.$ii());
                }
            }
            else {
                target = secondaryBucket;
                if (target.length > 0) {
                    target.push(new actions_1.$ii());
                }
            }
            for (let action of actions) {
                if (useAlternativeActions) {
                    action = action instanceof actions_2.$Vu && action.alt ? action.alt : action;
                }
                const newLen = target.push(action);
                // keep submenu info for later inlining
                if (action instanceof actions_1.$ji) {
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
    let $C3 = class $C3 extends actionViewItems_1.$NQ {
        constructor(action, options, S, U, W, X, Y, Z) {
            super(undefined, action, { icon: !!(action.class || action.item.icon), label: !action.class && !action.item.icon, draggable: options?.draggable, keybinding: options?.keybinding, hoverDelegate: options?.hoverDelegate });
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.n = false;
            this.r = this.B(new lifecycle_1.$lc());
            this.y = dom_1.$xP.getInstance();
        }
        get ab() {
            return this._action;
        }
        get bb() {
            return this.n && this.ab.alt || this.ab;
        }
        async onClick(event) {
            event.preventDefault();
            event.stopPropagation();
            try {
                await this.actionRunner.run(this.bb, this._context);
            }
            catch (err) {
                this.U.error(err);
            }
        }
        render(container) {
            super.render(container);
            container.classList.add('menu-entry');
            if (this.m.icon) {
                this.fb(this.ab.item);
            }
            if (this.ab.alt) {
                let isMouseOver = false;
                const updateAltState = () => {
                    const wantsAltCommand = !!this.ab.alt?.enabled &&
                        (!this.Z.isMotionReduced() || isMouseOver) && (this.y.keyStatus.altKey ||
                        (this.y.keyStatus.shiftKey && isMouseOver));
                    if (wantsAltCommand !== this.n) {
                        this.n = wantsAltCommand;
                        this.w();
                        this.C();
                        this.F();
                    }
                };
                this.B(this.y.event(updateAltState));
                this.B((0, dom_1.$nO)(container, 'mouseleave', _ => {
                    isMouseOver = false;
                    updateAltState();
                }));
                this.B((0, dom_1.$nO)(container, 'mouseenter', _ => {
                    isMouseOver = true;
                    updateAltState();
                }));
                updateAltState();
            }
        }
        w() {
            if (this.m.label && this.H) {
                this.H.textContent = this.bb.label;
            }
        }
        z() {
            const keybinding = this.S.lookupKeybinding(this.bb.id, this.W);
            const keybindingLabel = keybinding && keybinding.getLabel();
            const tooltip = this.bb.tooltip || this.bb.label;
            let title = keybindingLabel
                ? (0, nls_1.localize)(0, null, tooltip, keybindingLabel)
                : tooltip;
            if (!this.n && this.ab.alt?.enabled) {
                const altTooltip = this.ab.alt.tooltip || this.ab.alt.label;
                const altKeybinding = this.S.lookupKeybinding(this.ab.alt.id, this.W);
                const altKeybindingLabel = altKeybinding && altKeybinding.getLabel();
                const altTitleSection = altKeybindingLabel
                    ? (0, nls_1.localize)(1, null, altTooltip, altKeybindingLabel)
                    : altTooltip;
                title = (0, nls_1.localize)(2, null, title, keybindingLabels_1.$OR.modifierLabels[platform_1.OS].altKey, altTitleSection);
            }
            return title;
        }
        F() {
            if (this.m.icon) {
                if (this.bb !== this.ab) {
                    if (this.ab.alt) {
                        this.fb(this.ab.alt.item);
                    }
                }
                else {
                    this.fb(this.ab.item);
                }
            }
        }
        fb(item) {
            this.r.value = undefined;
            const { element, H: label } = this;
            if (!element || !label) {
                return;
            }
            const icon = this.bb.checked && (0, action_1.$Ol)(item.toggled) && item.toggled.icon ? item.toggled.icon : item.icon;
            if (!icon) {
                return;
            }
            if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                // theme icons
                const iconClasses = themables_1.ThemeIcon.asClassNameArray(icon);
                label.classList.add(...iconClasses);
                this.r.value = (0, lifecycle_1.$ic)(() => {
                    label.classList.remove(...iconClasses);
                });
            }
            else {
                // icon path/url - add special element with SVG-mask and icon color background
                const svgUrl = (0, theme_1.$fv)(this.X.getColorTheme().type)
                    ? (0, dom_1.$nP)(icon.dark)
                    : (0, dom_1.$nP)(icon.light);
                const svgIcon = (0, dom_1.$)('span');
                svgIcon.style.webkitMask = svgIcon.style.mask = `${svgUrl} no-repeat 50% 50%`;
                svgIcon.style.background = 'var(--vscode-icon-foreground)';
                svgIcon.style.display = 'inline-block';
                svgIcon.style.width = '100%';
                svgIcon.style.height = '100%';
                label.appendChild(svgIcon);
                label.classList.add('icon');
                this.r.value = (0, lifecycle_1.$hc)((0, lifecycle_1.$ic)(() => {
                    label.classList.remove('icon');
                    (0, dom_1.$_O)(label);
                }), this.X.onDidColorThemeChange(() => {
                    // refresh when the theme changes in case we go between dark <-> light
                    this.F();
                }));
            }
        }
    };
    exports.$C3 = $C3;
    exports.$C3 = $C3 = __decorate([
        __param(2, keybinding_1.$2D),
        __param(3, notification_1.$Yu),
        __param(4, contextkey_1.$3i),
        __param(5, themeService_1.$gv),
        __param(6, contextView_1.$WZ),
        __param(7, accessibility_1.$1r)
    ], $C3);
    let $D3 = class $D3 extends dropdownActionViewItem_1.$CR {
        constructor(action, options, g, r, N) {
            const dropdownOptions = {
                ...options,
                menuAsChild: options?.menuAsChild ?? false,
                classNames: options?.classNames ?? (themables_1.ThemeIcon.isThemeIcon(action.item.icon) ? themables_1.ThemeIcon.asClassName(action.item.icon) : undefined),
                keybindingProvider: options?.keybindingProvider ?? (action => g.lookupKeybinding(action.id))
            };
            super(action, { getActions: () => action.actions }, r, dropdownOptions);
            this.g = g;
            this.r = r;
            this.N = N;
        }
        render(container) {
            super.render(container);
            (0, types_1.$tf)(this.element);
            container.classList.add('menu-entry');
            const action = this._action;
            const { icon } = action.item;
            if (icon && !themables_1.ThemeIcon.isThemeIcon(icon)) {
                this.element.classList.add('icon');
                const setBackgroundImage = () => {
                    if (this.element) {
                        this.element.style.backgroundImage = ((0, theme_1.$fv)(this.N.getColorTheme().type)
                            ? (0, dom_1.$nP)(icon.dark)
                            : (0, dom_1.$nP)(icon.light));
                    }
                };
                setBackgroundImage();
                this.B(this.N.onDidColorThemeChange(() => {
                    // refresh when the theme changes in case we go between dark <-> light
                    setBackgroundImage();
                }));
            }
        }
    };
    exports.$D3 = $D3;
    exports.$D3 = $D3 = __decorate([
        __param(2, keybinding_1.$2D),
        __param(3, contextView_1.$WZ),
        __param(4, themeService_1.$gv)
    ], $D3);
    let $E3 = class $E3 extends actionViewItems_1.$MQ {
        get onDidChangeDropdownVisibility() {
            return this.g.onDidChangeVisibility;
        }
        constructor(submenuAction, options, r, s, y, H, I, J) {
            super(null, submenuAction);
            this.r = r;
            this.s = s;
            this.y = y;
            this.H = H;
            this.I = I;
            this.J = J;
            this.h = null;
            this.b = options;
            this.n = `${submenuAction.item.submenu.id}_lastActionId`;
            // determine default action
            let defaultAction;
            const defaultActionId = options?.persistLastActionId ? J.get(this.n, 1 /* StorageScope.WORKSPACE */) : undefined;
            if (defaultActionId) {
                defaultAction = submenuAction.actions.find(a => defaultActionId === a.id);
            }
            if (!defaultAction) {
                defaultAction = submenuAction.actions[0];
            }
            this.c = this.I.createInstance($C3, defaultAction, { keybinding: this.M(defaultAction) });
            const dropdownOptions = {
                keybindingProvider: action => this.r.lookupKeybinding(action.id),
                ...options,
                menuAsChild: options?.menuAsChild ?? true,
                classNames: options?.classNames ?? ['codicon', 'codicon-chevron-down'],
                actionRunner: options?.actionRunner ?? new actions_1.$hi(),
            };
            this.g = new dropdownActionViewItem_1.$CR(submenuAction, submenuAction.actions, this.y, dropdownOptions);
            this.g.actionRunner.onDidRun((e) => {
                if (e.action instanceof actions_2.$Vu) {
                    this.L(e.action);
                }
            });
        }
        L(lastAction) {
            if (this.b?.persistLastActionId) {
                this.J.store(this.n, lastAction.id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            this.c.dispose();
            this.c = this.I.createInstance($C3, lastAction, { keybinding: this.M(lastAction) });
            this.c.actionRunner = new class extends actions_1.$hi {
                async u(action, context) {
                    await action.run(undefined);
                }
            }();
            if (this.h) {
                this.c.render((0, dom_1.$$O)(this.h, (0, dom_1.$)('.action-container')));
            }
        }
        M(defaultAction) {
            let defaultActionKeybinding;
            if (this.b?.renderKeybindingWithDefaultActionLabel) {
                const kb = this.r.lookupKeybinding(defaultAction.id);
                if (kb) {
                    defaultActionKeybinding = `(${kb.getLabel()})`;
                }
            }
            return defaultActionKeybinding;
        }
        setActionContext(newContext) {
            super.setActionContext(newContext);
            this.c.setActionContext(newContext);
            this.g.setActionContext(newContext);
        }
        render(container) {
            this.h = container;
            super.render(this.h);
            this.h.classList.add('monaco-dropdown-with-default');
            const primaryContainer = (0, dom_1.$)('.action-container');
            this.c.render((0, dom_1.$0O)(this.h, primaryContainer));
            this.B((0, dom_1.$nO)(primaryContainer, dom_1.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(17 /* KeyCode.RightArrow */)) {
                    this.c.element.tabIndex = -1;
                    this.g.focus();
                    event.stopPropagation();
                }
            }));
            const dropdownContainer = (0, dom_1.$)('.dropdown-action-container');
            this.g.render((0, dom_1.$0O)(this.h, dropdownContainer));
            this.B((0, dom_1.$nO)(dropdownContainer, dom_1.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(15 /* KeyCode.LeftArrow */)) {
                    this.c.element.tabIndex = 0;
                    this.g.setFocusable(false);
                    this.c.element?.focus();
                    event.stopPropagation();
                }
            }));
        }
        focus(fromRight) {
            if (fromRight) {
                this.g.focus();
            }
            else {
                this.c.element.tabIndex = 0;
                this.c.element.focus();
            }
        }
        blur() {
            this.c.element.tabIndex = -1;
            this.g.blur();
            this.h.blur();
        }
        setFocusable(focusable) {
            if (focusable) {
                this.c.element.tabIndex = 0;
            }
            else {
                this.c.element.tabIndex = -1;
                this.g.setFocusable(false);
            }
        }
        dispose() {
            this.c.dispose();
            this.g.dispose();
            super.dispose();
        }
    };
    exports.$E3 = $E3;
    exports.$E3 = $E3 = __decorate([
        __param(2, keybinding_1.$2D),
        __param(3, notification_1.$Yu),
        __param(4, contextView_1.$WZ),
        __param(5, actions_2.$Su),
        __param(6, instantiation_1.$Ah),
        __param(7, storage_1.$Vo)
    ], $E3);
    let SubmenuEntrySelectActionViewItem = class SubmenuEntrySelectActionViewItem extends actionViewItems_1.$OQ {
        constructor(action, contextViewService) {
            super(null, action, action.actions.map(a => ({
                text: a.id === actions_1.$ii.ID ? '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500' : a.label,
                isDisabled: !a.enabled,
            })), 0, contextViewService, defaultStyles_1.$B2, { ariaLabel: action.tooltip, optionsAsChildren: true });
            this.select(Math.max(0, action.actions.findIndex(a => a.checked)));
        }
        render(container) {
            super.render(container);
            container.style.borderColor = (0, colorRegistry_1.$pv)(colorRegistry_1.$7v);
        }
        n(option, index) {
            const action = this.action.actions[index];
            if (action) {
                this.actionRunner.run(action);
            }
        }
    };
    SubmenuEntrySelectActionViewItem = __decorate([
        __param(1, contextView_1.$VZ)
    ], SubmenuEntrySelectActionViewItem);
    /**
     * Creates action view items for menu actions or submenu actions.
     */
    function $F3(instaService, action, options) {
        if (action instanceof actions_2.$Vu) {
            return instaService.createInstance($C3, action, options);
        }
        else if (action instanceof actions_2.$Uu) {
            if (action.item.isSelection) {
                return instaService.createInstance(SubmenuEntrySelectActionViewItem, action);
            }
            else {
                if (action.item.rememberDefaultAction) {
                    return instaService.createInstance($E3, action, { ...options, persistLastActionId: true });
                }
                else {
                    return instaService.createInstance($D3, action, options);
                }
            }
        }
        else {
            return undefined;
        }
    }
    exports.$F3 = $F3;
});
//# sourceMappingURL=menuEntryActionViewItem.js.map