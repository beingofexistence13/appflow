/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/touch", "vs/base/browser/ui/menu/menu", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls!vs/base/browser/ui/menu/menubar", "vs/css!./menubar"], function (require, exports, browser, DOM, keyboardEvent_1, mouseEvent_1, touch_1, menu_1, actions_1, arrays_1, async_1, codicons_1, themables_1, event_1, keyCodes_1, lifecycle_1, platform_1, strings, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VR = void 0;
    const $ = DOM.$;
    var MenubarState;
    (function (MenubarState) {
        MenubarState[MenubarState["HIDDEN"] = 0] = "HIDDEN";
        MenubarState[MenubarState["VISIBLE"] = 1] = "VISIBLE";
        MenubarState[MenubarState["FOCUSED"] = 2] = "FOCUSED";
        MenubarState[MenubarState["OPEN"] = 3] = "OPEN";
    })(MenubarState || (MenubarState = {}));
    class $VR extends lifecycle_1.$kc {
        static { this.OVERFLOW_INDEX = -1; }
        constructor(D, F, G) {
            super();
            this.D = D;
            this.F = F;
            this.G = G;
            // Input-related
            this.h = false;
            this.j = false;
            this.m = false;
            this.n = false;
            this.s = false;
            this.z = 0;
            this.C = undefined;
            this.D.setAttribute('role', 'menubar');
            if (this.R) {
                this.D.classList.add('compact');
            }
            this.a = [];
            this.r = new Map();
            this.t = MenubarState.VISIBLE;
            this.w = this.B(new event_1.$fd());
            this.y = this.B(new event_1.$fd());
            this.createOverflowMenu();
            this.g = this.B(new async_1.$Sg(() => this.update(), 200));
            this.u = this.F.actionRunner ?? this.B(new actions_1.$hi());
            this.B(this.u.onWillRun(() => {
                this.S();
            }));
            this.B(DOM.$xP.getInstance().event(this.bb, this));
            this.B(DOM.$nO(this.D, DOM.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                let eventHandled = true;
                const key = !!e.key ? e.key.toLocaleLowerCase() : '';
                const tabNav = platform_1.$j && !this.R;
                if (event.equals(15 /* KeyCode.LeftArrow */) || (tabNav && event.equals(2 /* KeyCode.Tab */ | 1024 /* KeyMod.Shift */))) {
                    this.U();
                }
                else if (event.equals(17 /* KeyCode.RightArrow */) || (tabNav && event.equals(2 /* KeyCode.Tab */))) {
                    this.W();
                }
                else if (event.equals(9 /* KeyCode.Escape */) && this.O && !this.P) {
                    this.S();
                }
                else if (!this.P && !event.ctrlKey && this.F.enableMnemonics && this.Y && this.r.has(key)) {
                    const menuIndex = this.r.get(key);
                    this.ab(menuIndex, false);
                }
                else {
                    eventHandled = false;
                }
                // Never allow default tab behavior when not compact
                if (!this.R && (event.equals(2 /* KeyCode.Tab */ | 1024 /* KeyMod.Shift */) || event.equals(2 /* KeyCode.Tab */))) {
                    event.preventDefault();
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
            this.B(DOM.$nO(window, DOM.$3O.MOUSE_DOWN, () => {
                // This mouse event is outside the menubar so it counts as a focus out
                if (this.O) {
                    this.S();
                }
            }));
            this.B(DOM.$nO(this.D, DOM.$3O.FOCUS_IN, (e) => {
                const event = e;
                if (event.relatedTarget) {
                    if (!this.D.contains(event.relatedTarget)) {
                        this.f = event.relatedTarget;
                    }
                }
            }));
            this.B(DOM.$nO(this.D, DOM.$3O.FOCUS_OUT, (e) => {
                const event = e;
                // We are losing focus and there is no related target, e.g. webview case
                if (!event.relatedTarget) {
                    this.S();
                }
                // We are losing focus and there is a target, reset focusToReturn value as not to redirect
                else if (event.relatedTarget && !this.D.contains(event.relatedTarget)) {
                    this.f = undefined;
                    this.S();
                }
            }));
            this.B(DOM.$nO(window, DOM.$3O.KEY_DOWN, (e) => {
                if (!this.F.enableMnemonics || !e.altKey || e.ctrlKey || e.defaultPrevented) {
                    return;
                }
                const key = e.key.toLocaleLowerCase();
                if (!this.r.has(key)) {
                    return;
                }
                this.Y = true;
                this.X(true);
                const menuIndex = this.r.get(key);
                this.ab(menuIndex, false);
            }));
            this.S();
        }
        push(arg) {
            const menus = (0, arrays_1.$1b)(arg);
            menus.forEach((menuBarMenu) => {
                const menuIndex = this.a.length;
                const cleanMenuLabel = (0, menu_1.$zR)(menuBarMenu.label);
                const mnemonicMatches = menu_1.$vR.exec(menuBarMenu.label);
                // Register mnemonics
                if (mnemonicMatches) {
                    const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
                    this.J(this.a.length, mnemonic);
                }
                if (this.R) {
                    this.a.push(menuBarMenu);
                }
                else {
                    const buttonElement = $('div.menubar-menu-button', { 'role': 'menuitem', 'tabindex': -1, 'aria-label': cleanMenuLabel, 'aria-haspopup': true });
                    const titleElement = $('div.menubar-menu-title', { 'role': 'none', 'aria-hidden': true });
                    buttonElement.appendChild(titleElement);
                    this.D.insertBefore(buttonElement, this.b.buttonElement);
                    this.I(titleElement, buttonElement, menuBarMenu.label);
                    this.B(DOM.$nO(buttonElement, DOM.$3O.KEY_UP, (e) => {
                        const event = new keyboardEvent_1.$jO(e);
                        let eventHandled = true;
                        if ((event.equals(18 /* KeyCode.DownArrow */) || event.equals(3 /* KeyCode.Enter */)) && !this.P) {
                            this.c = { index: menuIndex };
                            this.j = true;
                            this.N = MenubarState.OPEN;
                        }
                        else {
                            eventHandled = false;
                        }
                        if (eventHandled) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }));
                    this.B(touch_1.$EP.addTarget(buttonElement));
                    this.B(DOM.$nO(buttonElement, touch_1.EventType.Tap, (e) => {
                        // Ignore this touch if the menu is touched
                        if (this.P && this.c && this.c.holder && DOM.$NO(e.initialTarget, this.c.holder)) {
                            return;
                        }
                        this.n = false;
                        this.ab(menuIndex, true);
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                    this.B(DOM.$nO(buttonElement, DOM.$3O.MOUSE_DOWN, (e) => {
                        // Ignore non-left-click
                        const mouseEvent = new mouseEvent_1.$eO(e);
                        if (!mouseEvent.leftButton) {
                            e.preventDefault();
                            return;
                        }
                        if (!this.P) {
                            // Open the menu with mouse down and ignore the following mouse up event
                            this.n = true;
                            this.ab(menuIndex, true);
                        }
                        else {
                            this.n = false;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                    this.B(DOM.$nO(buttonElement, DOM.$3O.MOUSE_UP, (e) => {
                        if (e.defaultPrevented) {
                            return;
                        }
                        if (!this.n) {
                            if (this.O) {
                                this.ab(menuIndex, true);
                            }
                        }
                        else {
                            this.n = false;
                        }
                    }));
                    this.B(DOM.$nO(buttonElement, DOM.$3O.MOUSE_ENTER, () => {
                        if (this.P && !this.cb(menuIndex)) {
                            buttonElement.focus();
                            this.db();
                            this.eb(menuIndex, false);
                        }
                        else if (this.O && !this.P) {
                            this.c = { index: menuIndex };
                            buttonElement.focus();
                        }
                    }));
                    this.a.push({
                        label: menuBarMenu.label,
                        actions: menuBarMenu.actions,
                        buttonElement: buttonElement,
                        titleElement: titleElement
                    });
                }
            });
        }
        createOverflowMenu() {
            const label = this.R ? nls.localize(0, null) : nls.localize(1, null);
            const buttonElement = $('div.menubar-menu-button', { 'role': 'menuitem', 'tabindex': this.R ? 0 : -1, 'aria-label': label, 'aria-haspopup': true });
            const titleElement = $('div.menubar-menu-title.toolbar-toggle-more' + themables_1.ThemeIcon.asCSSSelector(codicons_1.$Pj.menuBarMore), { 'role': 'none', 'aria-hidden': true });
            buttonElement.appendChild(titleElement);
            this.D.appendChild(buttonElement);
            buttonElement.style.visibility = 'hidden';
            this.B(DOM.$nO(buttonElement, DOM.$3O.KEY_UP, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                let eventHandled = true;
                const triggerKeys = [3 /* KeyCode.Enter */];
                if (!this.R) {
                    triggerKeys.push(18 /* KeyCode.DownArrow */);
                }
                else {
                    triggerKeys.push(10 /* KeyCode.Space */);
                    if (this.F.compactMode === menu_1.Direction.Right) {
                        triggerKeys.push(17 /* KeyCode.RightArrow */);
                    }
                    else if (this.F.compactMode === menu_1.Direction.Left) {
                        triggerKeys.push(15 /* KeyCode.LeftArrow */);
                    }
                }
                if ((triggerKeys.some(k => event.equals(k)) && !this.P)) {
                    this.c = { index: $VR.OVERFLOW_INDEX };
                    this.j = true;
                    this.N = MenubarState.OPEN;
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
            this.B(touch_1.$EP.addTarget(buttonElement));
            this.B(DOM.$nO(buttonElement, touch_1.EventType.Tap, (e) => {
                // Ignore this touch if the menu is touched
                if (this.P && this.c && this.c.holder && DOM.$NO(e.initialTarget, this.c.holder)) {
                    return;
                }
                this.n = false;
                this.ab($VR.OVERFLOW_INDEX, true);
                e.preventDefault();
                e.stopPropagation();
            }));
            this.B(DOM.$nO(buttonElement, DOM.$3O.MOUSE_DOWN, (e) => {
                // Ignore non-left-click
                const mouseEvent = new mouseEvent_1.$eO(e);
                if (!mouseEvent.leftButton) {
                    e.preventDefault();
                    return;
                }
                if (!this.P) {
                    // Open the menu with mouse down and ignore the following mouse up event
                    this.n = true;
                    this.ab($VR.OVERFLOW_INDEX, true);
                }
                else {
                    this.n = false;
                }
                e.preventDefault();
                e.stopPropagation();
            }));
            this.B(DOM.$nO(buttonElement, DOM.$3O.MOUSE_UP, (e) => {
                if (e.defaultPrevented) {
                    return;
                }
                if (!this.n) {
                    if (this.O) {
                        this.ab($VR.OVERFLOW_INDEX, true);
                    }
                }
                else {
                    this.n = false;
                }
            }));
            this.B(DOM.$nO(buttonElement, DOM.$3O.MOUSE_ENTER, () => {
                if (this.P && !this.cb($VR.OVERFLOW_INDEX)) {
                    this.b.buttonElement.focus();
                    this.db();
                    this.eb($VR.OVERFLOW_INDEX, false);
                }
                else if (this.O && !this.P) {
                    this.c = { index: $VR.OVERFLOW_INDEX };
                    buttonElement.focus();
                }
            }));
            this.b = {
                buttonElement: buttonElement,
                titleElement: titleElement,
                label: 'More',
                actions: []
            };
        }
        updateMenu(menu) {
            const menuToUpdate = this.a.filter(menuBarMenu => menuBarMenu.label === menu.label);
            if (menuToUpdate && menuToUpdate.length) {
                menuToUpdate[0].actions = menu.actions;
            }
        }
        dispose() {
            super.dispose();
            this.a.forEach(menuBarMenu => {
                menuBarMenu.titleElement?.remove();
                menuBarMenu.buttonElement?.remove();
            });
            this.b.titleElement.remove();
            this.b.buttonElement.remove();
            (0, lifecycle_1.$fc)(this.C);
            this.C = undefined;
        }
        blur() {
            this.S();
        }
        getWidth() {
            if (!this.R && this.a) {
                const left = this.a[0].buttonElement.getBoundingClientRect().left;
                const right = this.Q ? this.b.buttonElement.getBoundingClientRect().right : this.a[this.a.length - 1].buttonElement.getBoundingClientRect().right;
                return right - left;
            }
            return 0;
        }
        getHeight() {
            return this.D.clientHeight;
        }
        toggleFocus() {
            if (!this.O && this.F.visibility !== 'hidden') {
                this.Y = true;
                this.c = { index: this.z > 0 ? 0 : $VR.OVERFLOW_INDEX };
                this.N = MenubarState.FOCUSED;
            }
            else if (!this.P) {
                this.S();
            }
        }
        H() {
            if (!this.a || !this.a.length) {
                return;
            }
            const overflowMenuOnlyClass = 'overflow-menu-only';
            // Remove overflow only restriction to allow the most space
            this.D.classList.toggle(overflowMenuOnlyClass, false);
            const sizeAvailable = this.D.offsetWidth;
            let currentSize = 0;
            let full = this.R;
            const prevNumMenusShown = this.z;
            this.z = 0;
            const showableMenus = this.a.filter(menu => menu.buttonElement !== undefined && menu.titleElement !== undefined);
            for (const menuBarMenu of showableMenus) {
                if (!full) {
                    const size = menuBarMenu.buttonElement.offsetWidth;
                    if (currentSize + size > sizeAvailable) {
                        full = true;
                    }
                    else {
                        currentSize += size;
                        this.z++;
                        if (this.z > prevNumMenusShown) {
                            menuBarMenu.buttonElement.style.visibility = 'visible';
                        }
                    }
                }
                if (full) {
                    menuBarMenu.buttonElement.style.visibility = 'hidden';
                }
            }
            // If below minimium menu threshold, show the overflow menu only as hamburger menu
            if (this.z - 1 <= showableMenus.length / 2) {
                for (const menuBarMenu of showableMenus) {
                    menuBarMenu.buttonElement.style.visibility = 'hidden';
                }
                full = true;
                this.z = 0;
                currentSize = 0;
            }
            // Overflow
            if (this.R) {
                this.b.actions = [];
                for (let idx = this.z; idx < this.a.length; idx++) {
                    this.b.actions.push(new actions_1.$ji(`menubar.submenu.${this.a[idx].label}`, this.a[idx].label, this.a[idx].actions || []));
                }
                const compactMenuActions = this.F.getCompactMenuActions?.();
                if (compactMenuActions && compactMenuActions.length) {
                    this.b.actions.push(new actions_1.$ii());
                    this.b.actions.push(...compactMenuActions);
                }
                this.b.buttonElement.style.visibility = 'visible';
            }
            else if (full) {
                // Can't fit the more button, need to remove more menus
                while (currentSize + this.b.buttonElement.offsetWidth > sizeAvailable && this.z > 0) {
                    this.z--;
                    const size = showableMenus[this.z].buttonElement.offsetWidth;
                    showableMenus[this.z].buttonElement.style.visibility = 'hidden';
                    currentSize -= size;
                }
                this.b.actions = [];
                for (let idx = this.z; idx < showableMenus.length; idx++) {
                    this.b.actions.push(new actions_1.$ji(`menubar.submenu.${showableMenus[idx].label}`, showableMenus[idx].label, showableMenus[idx].actions || []));
                }
                if (this.b.buttonElement.nextElementSibling !== showableMenus[this.z].buttonElement) {
                    this.b.buttonElement.remove();
                    this.D.insertBefore(this.b.buttonElement, showableMenus[this.z].buttonElement);
                }
                this.b.buttonElement.style.visibility = 'visible';
            }
            else {
                this.b.buttonElement.remove();
                this.D.appendChild(this.b.buttonElement);
                this.b.buttonElement.style.visibility = 'hidden';
            }
            // If we are only showing the overflow, add this class to avoid taking up space
            this.D.classList.toggle(overflowMenuOnlyClass, this.z === 0);
        }
        I(titleElement, buttonElement, label) {
            const cleanMenuLabel = (0, menu_1.$zR)(label);
            // Update the button label to reflect mnemonics
            if (this.F.enableMnemonics) {
                const cleanLabel = strings.$pe(label);
                // This is global so reset it
                menu_1.$wR.lastIndex = 0;
                let escMatch = menu_1.$wR.exec(cleanLabel);
                // We can't use negative lookbehind so we match our negative and skip
                while (escMatch && escMatch[1]) {
                    escMatch = menu_1.$wR.exec(cleanLabel);
                }
                const replaceDoubleEscapes = (str) => str.replace(/&amp;&amp;/g, '&amp;');
                if (escMatch) {
                    titleElement.innerText = '';
                    titleElement.append(strings.$ue(replaceDoubleEscapes(cleanLabel.substr(0, escMatch.index)), ' '), $('mnemonic', { 'aria-hidden': 'true' }, escMatch[3]), strings.$ve(replaceDoubleEscapes(cleanLabel.substr(escMatch.index + escMatch[0].length)), ' '));
                }
                else {
                    titleElement.innerText = replaceDoubleEscapes(cleanLabel).trim();
                }
            }
            else {
                titleElement.innerText = cleanMenuLabel.replace(/&&/g, '&');
            }
            const mnemonicMatches = menu_1.$vR.exec(label);
            // Register mnemonics
            if (mnemonicMatches) {
                const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
                if (this.F.enableMnemonics) {
                    buttonElement.setAttribute('aria-keyshortcuts', 'Alt+' + mnemonic.toLocaleLowerCase());
                }
                else {
                    buttonElement.removeAttribute('aria-keyshortcuts');
                }
            }
        }
        update(options) {
            if (options) {
                this.F = options;
            }
            // Don't update while using the menu
            if (this.O) {
                this.s = true;
                return;
            }
            this.a.forEach(menuBarMenu => {
                if (!menuBarMenu.buttonElement || !menuBarMenu.titleElement) {
                    return;
                }
                this.I(menuBarMenu.titleElement, menuBarMenu.buttonElement, menuBarMenu.label);
            });
            if (!this.C) {
                this.C = DOM.$vO(() => {
                    this.H();
                    this.C = undefined;
                });
            }
            this.S();
        }
        J(menuIndex, mnemonic) {
            this.r.set(mnemonic.toLocaleLowerCase(), menuIndex);
        }
        L() {
            if (this.D.style.display !== 'none') {
                this.D.style.display = 'none';
                this.w.fire(false);
            }
        }
        M() {
            if (this.D.style.display !== 'flex') {
                this.D.style.display = 'flex';
                this.w.fire(true);
                this.H();
            }
        }
        get N() {
            return this.t;
        }
        set N(value) {
            if (this.t >= MenubarState.FOCUSED && value < MenubarState.FOCUSED) {
                // Losing focus, update the menu if needed
                if (this.s) {
                    this.g.schedule();
                    this.s = false;
                }
            }
            if (value === this.t) {
                return;
            }
            const isVisible = this.isVisible;
            const isOpen = this.P;
            const isFocused = this.O;
            this.t = value;
            switch (value) {
                case MenubarState.HIDDEN:
                    if (isVisible) {
                        this.L();
                    }
                    if (isOpen) {
                        this.db();
                    }
                    if (isFocused) {
                        this.c = undefined;
                        if (this.f) {
                            this.f.focus();
                            this.f = undefined;
                        }
                    }
                    break;
                case MenubarState.VISIBLE:
                    if (!isVisible) {
                        this.M();
                    }
                    if (isOpen) {
                        this.db();
                    }
                    if (isFocused) {
                        if (this.c) {
                            if (this.c.index === $VR.OVERFLOW_INDEX) {
                                this.b.buttonElement.blur();
                            }
                            else {
                                this.a[this.c.index].buttonElement?.blur();
                            }
                        }
                        this.c = undefined;
                        if (this.f) {
                            this.f.focus();
                            this.f = undefined;
                        }
                    }
                    break;
                case MenubarState.FOCUSED:
                    if (!isVisible) {
                        this.M();
                    }
                    if (isOpen) {
                        this.db();
                    }
                    if (this.c) {
                        if (this.c.index === $VR.OVERFLOW_INDEX) {
                            this.b.buttonElement.focus();
                        }
                        else {
                            this.a[this.c.index].buttonElement?.focus();
                        }
                    }
                    break;
                case MenubarState.OPEN:
                    if (!isVisible) {
                        this.M();
                    }
                    if (this.c) {
                        this.eb(this.c.index, this.j);
                    }
                    break;
            }
            this.t = value;
            this.y.fire(this.N >= MenubarState.FOCUSED);
        }
        get isVisible() {
            return this.N >= MenubarState.VISIBLE;
        }
        get O() {
            return this.N >= MenubarState.FOCUSED;
        }
        get P() {
            return this.N >= MenubarState.OPEN;
        }
        get Q() {
            return this.R || this.z < this.a.length;
        }
        get R() {
            return this.F.compactMode !== undefined;
        }
        S() {
            if (this.F.visibility === 'toggle' || this.F.visibility === 'hidden') {
                this.N = MenubarState.HIDDEN;
            }
            else if (this.F.visibility === 'classic' && browser.$3N()) {
                this.N = MenubarState.HIDDEN;
            }
            else {
                this.N = MenubarState.VISIBLE;
            }
            this.n = false;
            this.Y = false;
            this.X(false);
        }
        U() {
            if (!this.c || this.z === 0) {
                return;
            }
            let newFocusedIndex = (this.c.index - 1 + this.z) % this.z;
            if (this.c.index === $VR.OVERFLOW_INDEX) {
                newFocusedIndex = this.z - 1;
            }
            else if (this.c.index === 0 && this.Q) {
                newFocusedIndex = $VR.OVERFLOW_INDEX;
            }
            if (newFocusedIndex === this.c.index) {
                return;
            }
            if (this.P) {
                this.db();
                this.eb(newFocusedIndex);
            }
            else if (this.O) {
                this.c.index = newFocusedIndex;
                if (newFocusedIndex === $VR.OVERFLOW_INDEX) {
                    this.b.buttonElement.focus();
                }
                else {
                    this.a[newFocusedIndex].buttonElement?.focus();
                }
            }
        }
        W() {
            if (!this.c || this.z === 0) {
                return;
            }
            let newFocusedIndex = (this.c.index + 1) % this.z;
            if (this.c.index === $VR.OVERFLOW_INDEX) {
                newFocusedIndex = 0;
            }
            else if (this.c.index === this.z - 1) {
                newFocusedIndex = $VR.OVERFLOW_INDEX;
            }
            if (newFocusedIndex === this.c.index) {
                return;
            }
            if (this.P) {
                this.db();
                this.eb(newFocusedIndex);
            }
            else if (this.O) {
                this.c.index = newFocusedIndex;
                if (newFocusedIndex === $VR.OVERFLOW_INDEX) {
                    this.b.buttonElement.focus();
                }
                else {
                    this.a[newFocusedIndex].buttonElement?.focus();
                }
            }
        }
        X(visible) {
            if (this.a) {
                this.a.forEach(menuBarMenu => {
                    if (menuBarMenu.titleElement && menuBarMenu.titleElement.children.length) {
                        const child = menuBarMenu.titleElement.children.item(0);
                        if (child) {
                            child.style.textDecoration = (this.F.alwaysOnMnemonics || visible) ? 'underline' : '';
                        }
                    }
                });
            }
        }
        get Y() {
            return this.h;
        }
        set Y(value) {
            this.h = value;
        }
        get Z() {
            if (platform_1.$j) {
                return false;
            }
            if (!this.F.disableAltFocus) {
                return true;
            }
            if (this.F.visibility === 'toggle') {
                return true;
            }
            return false;
        }
        get onVisibilityChange() {
            return this.w.event;
        }
        get onFocusStateChange() {
            return this.y.event;
        }
        ab(menuIndex, clicked) {
            if (this.P) {
                if (this.cb(menuIndex)) {
                    this.S();
                }
                else {
                    this.db();
                    this.eb(menuIndex, this.j);
                }
            }
            else {
                this.c = { index: menuIndex };
                this.j = !clicked;
                this.N = MenubarState.OPEN;
            }
        }
        bb(modifierKeyStatus) {
            const allModifiersReleased = !modifierKeyStatus.altKey && !modifierKeyStatus.ctrlKey && !modifierKeyStatus.shiftKey && !modifierKeyStatus.metaKey;
            if (this.F.visibility === 'hidden') {
                return;
            }
            // Prevent alt-key default if the menu is not hidden and we use alt to focus
            if (modifierKeyStatus.event && this.Z) {
                if (keyCodes_1.$sq.toEnum(modifierKeyStatus.event.code) === 159 /* ScanCode.AltLeft */) {
                    modifierKeyStatus.event.preventDefault();
                }
            }
            // Alt key pressed while menu is focused. This should return focus away from the menubar
            if (this.O && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.altKey) {
                this.S();
                this.Y = false;
                this.m = true;
            }
            // Clean alt key press and release
            if (allModifiersReleased && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.lastKeyReleased === 'alt') {
                if (!this.m) {
                    if (!this.O && this.Z) {
                        this.Y = true;
                        this.c = { index: this.z > 0 ? 0 : $VR.OVERFLOW_INDEX };
                        this.N = MenubarState.FOCUSED;
                    }
                    else if (!this.P) {
                        this.S();
                    }
                }
            }
            // Alt key released
            if (!modifierKeyStatus.altKey && modifierKeyStatus.lastKeyReleased === 'alt') {
                this.m = false;
            }
            if (this.F.enableMnemonics && this.a && !this.P) {
                this.X((!this.m && modifierKeyStatus.altKey) || this.Y);
            }
        }
        cb(menuIndex) {
            if (!this.c) {
                return false;
            }
            return this.c.index === menuIndex;
        }
        db() {
            if (this.c) {
                // Remove focus from the menus first
                if (this.c.index === $VR.OVERFLOW_INDEX) {
                    this.b.buttonElement.focus();
                }
                else {
                    this.a[this.c.index].buttonElement?.focus();
                }
                if (this.c.holder) {
                    this.c.holder.parentElement?.classList.remove('open');
                    this.c.holder.remove();
                }
                this.c.widget?.dispose();
                this.c = { index: this.c.index };
            }
        }
        eb(menuIndex, selectFirst = true) {
            const actualMenuIndex = menuIndex >= this.z ? $VR.OVERFLOW_INDEX : menuIndex;
            const customMenu = actualMenuIndex === $VR.OVERFLOW_INDEX ? this.b : this.a[actualMenuIndex];
            if (!customMenu.actions || !customMenu.buttonElement || !customMenu.titleElement) {
                return;
            }
            const menuHolder = $('div.menubar-menu-items-holder', { 'title': '' });
            customMenu.buttonElement.classList.add('open');
            const titleBoundingRect = customMenu.titleElement.getBoundingClientRect();
            const titleBoundingRectZoom = DOM.$GO(customMenu.titleElement);
            if (this.F.compactMode === menu_1.Direction.Right) {
                menuHolder.style.top = `${titleBoundingRect.top}px`;
                menuHolder.style.left = `${titleBoundingRect.left + this.D.clientWidth}px`;
            }
            else if (this.F.compactMode === menu_1.Direction.Left) {
                menuHolder.style.top = `${titleBoundingRect.top}px`;
                menuHolder.style.right = `${this.D.clientWidth}px`;
                menuHolder.style.left = 'auto';
            }
            else {
                menuHolder.style.top = `${titleBoundingRect.bottom * titleBoundingRectZoom}px`;
                menuHolder.style.left = `${titleBoundingRect.left * titleBoundingRectZoom}px`;
            }
            customMenu.buttonElement.appendChild(menuHolder);
            const menuOptions = {
                getKeyBinding: this.F.getKeybinding,
                actionRunner: this.u,
                enableMnemonics: this.F.alwaysOnMnemonics || (this.Y && this.F.enableMnemonics),
                ariaLabel: customMenu.buttonElement.getAttribute('aria-label') ?? undefined,
                expandDirection: this.R ? this.F.compactMode : menu_1.Direction.Right,
                useEventAsContext: true
            };
            const menuWidget = this.B(new menu_1.$yR(menuHolder, customMenu.actions, menuOptions, this.G));
            this.B(menuWidget.onDidCancel(() => {
                this.N = MenubarState.FOCUSED;
            }));
            if (actualMenuIndex !== menuIndex) {
                menuWidget.trigger(menuIndex - this.z);
            }
            else {
                menuWidget.focus(selectFirst);
            }
            this.c = {
                index: actualMenuIndex,
                holder: menuHolder,
                widget: menuWidget
            };
        }
    }
    exports.$VR = $VR;
});
//# sourceMappingURL=menubar.js.map